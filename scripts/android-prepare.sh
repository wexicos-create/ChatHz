#!/usr/bin/env bash
set -euo pipefail
# Generación reproducible del proyecto Gradle Android con Capacitor.
if [[ ! -d android ]]; then
  npx cap add android
fi
npx cap sync android
python3 - <<'PY'
from pathlib import Path
p = Path("android/app/src/main/AndroidManifest.xml")
s = p.read_text()
perm = '<uses-permission android:name="android.permission.RECORD_AUDIO" />'
if perm not in s:
    s = s.replace('<application', perm + '\n    <application', 1)
p.write_text(s)
PY
MAIN=android/app/src/main/java/com/platicasancestrales/chatz/MainActivity.java
mkdir -p "$(dirname "$MAIN")"
cp android-src/MainActivity.java "$MAIN"
