#!/usr/bin/env bash
# Install vnstat + the VMISS traffic API. Run as root from this directory.
# Re-running keeps the existing token and settings in /etc/vmiss-traffic.env.
set -euo pipefail
cd "$(dirname "$0")"
ENV=/etc/vmiss-traffic.env
DB=/var/lib/vnstat/vnstat.db

command -v python3 >/dev/null || { apt-get update -qq; apt-get install -y -qq python3 >/dev/null; }
if [ ! -f "$ENV" ]; then
  sed "s/^VMISS_TOKEN=.*/VMISS_TOKEN=$(python3 -c 'import secrets; print(secrets.token_urlsafe(24))')/" vmiss-traffic.env.example > "$ENV"
  chmod 600 "$ENV"
fi
set -a; . "$ENV"; set +a
TZNAME="Etc/GMT$(printf '%+d' "$((-VMISS_UTC_OFFSET))")"

# vnstatd must write its daily buckets in VMISS time so a billing day starts at a
# bucket boundary. Put the time zone in place before the package first starts it.
mkdir -p /etc/systemd/system/vnstat.service.d
DROPIN=/etc/systemd/system/vnstat.service.d/vmiss-tz.conf
OLD_TZ=$(sed -n 's/^Environment=TZ=//p' "$DROPIN" 2>/dev/null || true)
printf '[Service]\nEnvironment=TZ=%s\n' "$TZNAME" > "$DROPIN"
systemctl daemon-reload

FRESH=0; command -v vnstatd >/dev/null || FRESH=1
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq vnstat >/dev/null
sed -i -E "s/^;?Interface .*/Interface \"${VMISS_IFACE}\"/" /etc/vnstat.conf

# A database written in another time zone has misdated buckets ("update is in
# the future"). Start over only when it holds no data worth keeping.
if [ "$FRESH" = 1 ] || { [ "$OLD_TZ" != "$TZNAME" ] && [ -n "$OLD_TZ" ]; }; then
  systemctl stop vnstat
  rm -f "$DB"
  [ "$FRESH" = 1 ] || echo "warning: time zone changed ($OLD_TZ -> $TZNAME); vnstat history was reset"
fi

install -D -m 755 server.py /opt/vmiss-traffic/server.py
install -m 644 vmiss-traffic.service /etc/systemd/system/vmiss-traffic.service
systemctl daemon-reload
systemctl enable vnstat vmiss-traffic >/dev/null 2>&1
systemctl restart vnstat vmiss-traffic
echo "API: http://<server-ip>:${VMISS_PORT}/traffic  (header X-Token from $ENV)"
