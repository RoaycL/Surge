#!/usr/bin/env bash
# Install vnstat + the VMISS traffic API. Run as root from this directory.
# Re-running keeps the existing token and settings in /etc/vmiss-traffic.env.
set -euo pipefail
cd "$(dirname "$0")"
ENV=/etc/vmiss-traffic.env
DB=/var/lib/vnstat/vnstat.db
OLD_DROPIN=/etc/systemd/system/vnstat.service.d/vmiss-tz.conf

apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq vnstat python3 >/dev/null

if [ ! -f "$ENV" ]; then
  sed "s/^VMISS_TOKEN=.*/VMISS_TOKEN=$(python3 -c 'import secrets; print(secrets.token_urlsafe(24))')/" vmiss-traffic.env.example > "$ENV"
  chmod 600 "$ENV"
fi
set -a; . "$ENV"; set +a

# The panel picks its own reset day / time zone, so the server counts in hourly
# buckets and keeps them longer than a billing period (default is 4 days).
sed -i -E "s/^;?Interface .*/Interface \"${VMISS_IFACE}\"/; s/^;?HourlyDays .*/HourlyDays 70/" /etc/vnstat.conf
grep -q '^HourlyDays 70' /etc/vnstat.conf || echo 'HourlyDays 70' >> /etc/vnstat.conf

# Earlier versions ran vnstatd in a forced time zone; those buckets are misdated now.
if [ -f "$OLD_DROPIN" ]; then
  systemctl stop vnstat
  rm -f "$OLD_DROPIN" "$DB"
  rmdir /etc/systemd/system/vnstat.service.d 2>/dev/null || true
  echo "note: vnstat history was reset when switching to hourly buckets; set VMISS_BASE_BYTES/VMISS_BASE_AT if needed"
fi

install -D -m 755 server.py /opt/vmiss-traffic/server.py
install -m 644 vmiss-traffic.service /etc/systemd/system/vmiss-traffic.service
systemctl daemon-reload
systemctl enable vnstat vmiss-traffic >/dev/null 2>&1
systemctl restart vnstat vmiss-traffic
echo "API: http://<server-ip>:${VMISS_PORT}/traffic?reset_day=${VMISS_RESET_DAY}&utc_offset=${VMISS_UTC_OFFSET}  (header X-Token from $ENV)"
