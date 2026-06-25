#!/usr/bin/env bash
# One-shot: auth check → GitHub push → EC2 deploy prep
# Run in Cursor Terminal or Terminal.app (NOT via agent — agent shell is blocked).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
REPO_OWNER="${GITHUB_OWNER:-ibrahimmukherjee-boop}"
REPO_NAME="${GITHUB_REPO:-leonardo-museum-web}"
AWS_REGION="${AWS_REGION:-eu-west-1}"
INSTANCE_TYPE="${INSTANCE_TYPE:-t3.xlarge}"
KEY_NAME="${AWS_KEY_NAME:-leonardo-museum-key}"

echo "=============================================="
echo " Leonardo Museum — AWS + GitHub deploy"
echo " Account: DVNC.AI (684897143924)"
echo "=============================================="

# --- GitHub ---
echo ""
echo ">>> STEP 1: GitHub"
if ! gh auth status >/dev/null 2>&1; then
  echo "NOT LOGGED IN — run this now (browser/device code will appear):"
  echo "  gh auth login"
  echo ""
  read -r -p "Press Enter after gh auth login succeeds..."
fi
echo "GitHub user: $(gh api user -q .login)"

if [ ! -d .git ]; then git init; fi
git add -A
git diff --cached --quiet || git commit -m "Leonardo Museum — Ollama production deploy"

if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create "$REPO_NAME" --private --source=. --remote=origin --push || \
    gh repo create "$REPO_OWNER/$REPO_NAME" --private --source=. --remote=origin --push
else
  git push -u origin HEAD:main 2>/dev/null || git push -u origin HEAD:master
fi
REPO_URL="https://github.com/$REPO_OWNER/$REPO_NAME"
echo "Repo: $REPO_URL"

# --- AWS ---
echo ""
echo ">>> STEP 2: AWS CLI"
if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "NOT LOGGED IN — choose ONE:"
  echo "  A) Access keys:  aws configure"
  echo "     (IAM → Users → Security credentials → Create access key)"
  echo "  B) SSO:          aws configure sso && aws sso login"
  echo ""
  read -r -p "Press Enter after aws sts get-caller-identity works..."
fi
aws sts get-caller-identity

# --- EC2 key pair ---
echo ""
echo ">>> STEP 3: EC2 key pair ($KEY_NAME)"
KEY_FILE="$HOME/.ssh/${KEY_NAME}.pem"
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
  aws ec2 create-key-pair --key-name "$KEY_NAME" --region "$AWS_REGION" \
    --query 'KeyMaterial' --output text > "$KEY_FILE"
  chmod 400 "$KEY_FILE"
  echo "Created key: $KEY_FILE"
else
  echo "Key pair $KEY_NAME already exists in $AWS_REGION"
  [ -f "$KEY_FILE" ] || echo "WARN: use existing $KEY_FILE or download from AWS console"
fi

# --- Security group ---
SG_NAME="leonardo-museum-sg"
SG_ID=$(aws ec2 describe-security-groups --region "$AWS_REGION" \
  --filters "Name=group-name,Values=$SG_NAME" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)
if [ "$SG_ID" = "None" ] || [ -z "$SG_ID" ]; then
  SG_ID=$(aws ec2 create-security-group --group-name "$SG_NAME" \
    --description "Leonardo Museum" --region "$AWS_REGION" --query 'GroupId' --output text)
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --region "$AWS_REGION" \
    --protocol tcp --port 22 --cidr 0.0.0.0/0
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --region "$AWS_REGION" \
    --protocol tcp --port 80 --cidr 0.0.0.0/0
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --region "$AWS_REGION" \
    --protocol tcp --port 443 --cidr 0.0.0.0/0
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --region "$AWS_REGION" \
    --protocol tcp --port 8080 --cidr 0.0.0.0/0
  echo "Created security group: $SG_ID"
fi

# --- Ubuntu AMI ---
AMI=$(aws ec2 describe-images --region "$AWS_REGION" --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
  --query 'sort_by(Images,&CreationDate)[-1].ImageId' --output text)
echo "AMI: $AMI"

# --- Launch or find instance ---
INSTANCE_ID=$(aws ec2 describe-instances --region "$AWS_REGION" \
  --filters "Name=tag:Name,Values=leonardo-museum" "Name=instance-state-name,Values=running,pending" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text 2>/dev/null || true)

if [ "$INSTANCE_ID" = "None" ] || [ -z "$INSTANCE_ID" ]; then
  INSTANCE_ID=$(aws ec2 run-instances --region "$AWS_REGION" \
    --image-id "$AMI" --instance-type "$INSTANCE_TYPE" --key-name "$KEY_NAME" \
    --security-group-ids "$SG_ID" --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":40,"VolumeType":"gp3"}}]' \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=leonardo-museum}]' \
    --query 'Instances[0].InstanceId' --output text)
  echo "Launched instance: $INSTANCE_ID"
  aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$AWS_REGION"
else
  echo "Using existing instance: $INSTANCE_ID"
fi

PUBLIC_IP=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --region "$AWS_REGION" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
echo "Public IP: $PUBLIC_IP"

# --- GitHub Actions secrets ---
echo ""
echo ">>> STEP 4: GitHub Actions secrets"
if [ -f "$KEY_FILE" ]; then
  gh secret set DEPLOY_HOST --body "$PUBLIC_IP" --repo "$REPO_OWNER/$REPO_NAME"
  gh secret set DEPLOY_USER --body "ubuntu" --repo "$REPO_OWNER/$REPO_NAME"
  gh secret set DEPLOY_SSH_KEY < "$KEY_FILE" --repo "$REPO_OWNER/$REPO_NAME"
  echo "Secrets DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY set."
fi

# --- Bootstrap server ---
echo ""
echo ">>> STEP 5: Bootstrap EC2 (SSH)"
sleep 30
for i in $(seq 1 30); do
  ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i "$KEY_FILE" ubuntu@"$PUBLIC_IP" "echo ok" 2>/dev/null && break
  echo "Waiting for SSH ($i/30)..."
  sleep 10
done

ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@"$PUBLIC_IP" << 'REMOTE'
set -e
sudo apt-get update -qq
sudo apt-get install -y ca-certificates curl git
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker ubuntu
fi
sudo mkdir -p /opt/leonardo-museum
sudo chown ubuntu:ubuntu /opt/leonardo-museum
REMOTE

ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@"$PUBLIC_IP" << REMOTE
set -e
cd /opt/leonardo-museum
if [ ! -d .git ]; then
  git clone https://github.com/$REPO_OWNER/$REPO_NAME.git .
fi
git pull
docker compose up -d --build
REMOTE

echo ""
echo "=============================================="
echo " DONE"
echo " Site:  http://$PUBLIC_IP:8080/#/login"
echo " Health: http://$PUBLIC_IP:8080/api/health"
echo " Repo:  $REPO_URL"
echo "=============================================="
echo "First boot pulls Ollama model — allow 10-15 min."
echo "Check: docker compose -f /opt/leonardo-museum/docker-compose.yml logs -f"
