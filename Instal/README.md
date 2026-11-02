# ChatHz · Android Gradle APK

La APK anterior era un archivo de texto de 814 bytes y **no se podía instalar**. Se eliminó.

La automatización [.github/workflows/android-apk.yml](../.github/workflows/android-apk.yml) compila con Capacitor y **Gradle**:
1. Instala dependencias y compila React/Vite.
2. Genera el proyecto Android y declara RECORD_AUDIO.
3. Ejecuta `android/gradlew --no-daemon assembleDebug`.
4. Verifica que la APK exista y tenga estructura ZIP válida.
5. Publica el archivo real en los artefactos de GitHub Actions y trata de guardarlo como `Instal/ChatHz.apk`.

**APK de depuración**, instalable para pruebas en Android. Para distribución pública debe crearse una versión release con certificado de firma propio.

El analizador es acústico y necesita acceso al micrófono. No funciona continuamente en segundo plano ni detecta emisiones espaciales mediante el teléfono.
