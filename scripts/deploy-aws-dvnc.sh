#!/usr/bin/env bash
# Deploy full Leonardo Museum (SPA + art + CORTEX API + Ollama SLM) on AWS EC2.
# Account: DVNC.AI (684897143924)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPO_OWNER="${GITHUB_OWNER:-ibrahimmukherjee-boop}"
REPO_NAME="${GITHUB_REPO:-Museum_Edit}"
AWS_REGION="${AWS_REGION:-us-east-1}"
INSTANCE_TYPE="${INSTANCE_TYPE:-t3.xlarge}"
KEY_NAME="${AWS_KEY_NAME:-leonardo-museum-dvnc}"
VOLUME_GB="${VOLUME_GB:-50}"

echo "=============================================="
echo " Leonardo Museum — AWS full stack (DVNC.AI)"
echo " Account: 684897143924"
echo " Region:  $AWS_REGION"
echo " Repo:    $REPO_OWNER/$REPO_NAME"
echo "=============================================="

echo ""
echo ">>> Checking AWS credentials"
aws sts get-caller-identity
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
if [ "$ACCOUNT_ID" != "684897143924" ]; then
  echo "WARN: logged into account $ACCOUNT_ID (expected 684897143924)"
fi

echo ""
echo ">>> EC2 key pair ($KEY_NAME)"
KEY_FILE="${HOME}/.ssh/${KEY_NAME}.pem"
mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
  aws ec2 create-key-pair --key-name "$KEY_NAME" --region "$AWS_REGION" \
    --query 'KeyMaterial' --output text > "$KEY_FILE"
  chmod 400 "$KEY_FILE"
  echo "Created key: $KEY_FILE"
else
  echo "Key pair exists: $KEY_NAME"
  [ -f "$KEY_FILE" ] || echo "WARN: missing local key $KEY_FILE — use existing PEM or create new pair in console"
fi

echo ""
echo ">>> Security group"
SG_NAME="leonardo-museum-dvnc-sg"
SG_ID="$(aws ec2 describe-security-groups --region "$AWS_REGION" \
  --filters "Name=group-name,Values=$SG_NAME" \
  --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)"
if [ -z "$SG_ID" ] || [ "$SG_ID" = "None" ]; then
  SG_ID="$(aws ec2 create-security-group --group-name "$SG_NAME" \
    --description "Leonardo Museum DVNC HTTP HTTPS SSH 8080" \
    --region "$AWS_REGION" --query 'GroupId' --output text)"
  for PORT in 22 80 443 8080; do
    aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --region "$AWS_REGION" \
      --protocol tcp --port "$PORT" --cidr 0.0.0.0/0 >/dev/null
  done
  echo "Created SG: $SG_ID"
else
  echo "Using SG: $SG_ID"
fi

echo ""
echo ">>> Ubuntu 22.04 AMI"
AMI="$(aws ec2 describe-images --region "$AWS_REGION" --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
  --query 'sort_by(Images,&CreationDate)[-1].ImageId' --output text)"
echo "AMI: $AMI"

USER_DATA_FILE="$ROOT/deploy/aws/ec2-user-data.sh"

echo ""
echo ">>> EC2 instance (leonardo-museum-dvnc)"
INSTANCE_ID="$(aws ec2 describe-instances --region "$AWS_REGION" \
  --filters "Name=tag:Name,Values=leonardo-museum-dvnc" "Name=instance-state-name,Values=running,pending,stopped" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text 2>/dev/null || true)"

if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
  INSTANCE_ID="$(aws ec2 run-instances --region "$AWS_REGION" \
    --image-id "$AMI" \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SG_ID" \
    --user-data "file://${USER_DATA_FILE}" \
    --block-device-mappings "[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"VolumeSize\":${VOLUME_GB},\"VolumeType\":\"gp3\",\"DeleteOnTermination\":true}}]" \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=leonardo-museum-dvnc},{Key=Project,Value=leonardo-museum},{Key=Account,Value=DVNC.AI}]' \
    --query 'Instances[0].InstanceId' --output text)"
  echo "Launched: $INSTANCE_ID"
  aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$AWS_REGION"
else
  echo "Using existing: $INSTANCE_ID"
  STATE="$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --region "$AWS_REGION" \
    --query 'Reservations[0].Instances[0].State.Name' --output text)"
  if [ "$STATE" = "stopped" ]; then
    aws ec2 start-instances --instance-ids "$INSTANCE_ID" --region "$AWS_REGION" >/dev/null
    aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$AWS_REGION"
  fi
fi

PUBLIC_IP="$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --region "$AWS_REGION" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)"
echo "Public IP: $PUBLIC_IP"

echo ""
echo ">>> GitHub Actions deploy secrets"
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1 && [ -f "$KEY_FILE" ]; then
  gh secret set DEPLOY_HOST --body "$PUBLIC_IP" --repo "$REPO_OWNER/$REPO_NAME"
  gh secret set DEPLOY_USER --body "ubuntu" --repo "$REPO_OWNER/$REPO_NAME"
  gh secret set DEPLOY_SSH_KEY < "$KEY_FILE" --repo "$REPO_OWNER/$REPO_NAME"
  gh variable set AWS_DEPLOY --body "true" --repo "$REPO_OWNER/$REPO_NAME" 2>/dev/null || \
    gh variable set AWS_DEPLOY --body "true" --repo "$REPO_OWNER/$REPO_NAME"
  echo "GitHub secrets + AWS_DEPLOY variable set."
fi

echo ""
echo ">>> Waiting for SSH + finishing bootstrap"
sleep 25
for i in $(seq 1 36); do
  if [ -f "$KEY_FILE" ] && ssh -o StrictHostKeyChecking=no -o ConnectTimeout=8 -i "$KEY_FILE" "ubuntu@${PUBLIC_IP}" "echo ok" 2>/dev/null; then
    break
  fi
  echo "  SSH attempt $i/36..."
  sleep 10
done

if [ -f "$KEY_FILE" ]; then
  ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" "ubuntu@${PUBLIC_IP}" <<REMOTE
set -e
cd /opt/leonardo-museum
if [ ! -d .git ]; then
  git clone https://github.com/${REPO_OWNER}/${REPO_NAME}.git .
fi
git pull origin main || true
docker compose up -d --build
REMOTE
fi

echo ""
echo "=============================================="
echo " DEPLOYED — Leonardo Museum (full stack)"
echo " Site:   http://${PUBLIC_IP}:8080/#/login"
echo " Health: http://${PUBLIC_IP}:8080/api/health"
echo " Login:  dvnc.ai / ColoradoMuseum"
echo " Instance: $INSTANCE_ID ($INSTANCE_TYPE)"
echo " SSH:    ssh -i ${KEY_FILE} ubuntu@${PUBLIC_IP}"
echo "=============================================="
echo "First boot pulls Ollama qwen2.5:3b — allow 10–20 min."
echo "Logs:   ssh -i ${KEY_FILE} ubuntu@${PUBLIC_IP} 'cd /opt/leonardo-museum && docker compose logs -f'"
