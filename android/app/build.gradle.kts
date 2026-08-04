plugins {
    id("com.android.application")
}

android {
    namespace = "com.neuroflow.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.neuroflow.app"
        minSdk = 26
        targetSdk = 34
        // versionCode creciente: en CI lo inyecta el run number (NF_VERSION_CODE),
        // así cada build es una actualización válida y se instala encima sin
        // desinstalar. En local queda en 1.
        versionCode = System.getenv("NF_VERSION_CODE")?.toIntOrNull() ?: 1
        versionName = "1.0.${System.getenv("NF_VERSION_CODE") ?: "0"}"
    }

    // Clave debug FIJA y versionada: así todas las compilaciones (locales y de CI)
    // comparten firma y Android permite actualizar el APK encima sin desinstalar.
    // Una clave debug no es secreta; contraseñas estándar de Android.
    // Clave debug FIJA y versionada: así todas las compilaciones (locales y de CI)
    // comparten firma y Android permite actualizar el APK encima sin desinstalar.
    // Una clave debug no es secreta; contraseñas estándar de Android.
    signingConfigs {
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
            enableV1Signing = true
            enableV2Signing = true
            enableV3Signing = true
        }
        // Clave de RELEASE fija y versionada (auto-firmada). No es de Play Store,
        // pero sí un release real y estable: se instala/actualiza por sideload sin
        // desinstalar. Una clave de firma de app no es un secreto de servidor.
        create("release") {
            storeFile = file("release.keystore")
            storePassword = "neuroflow"
            keyAlias = "neuroflow"
            keyPassword = "neuroflow"
            enableV1Signing = true
            enableV2Signing = true
            enableV3Signing = true
        }
    }

    buildTypes {
        getByName("debug") {
            signingConfig = signingConfigs.getByName("debug")
        }
        getByName("release") {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    // Alinea la stdlib de Kotlin para evitar checkDebugDuplicateClasses.
    implementation(platform("org.jetbrains.kotlin:kotlin-bom:1.9.24"))
    // Sirve los assets bajo https://appassets.androidx.org (contexto seguro:
    // WebCrypto/localStorage funcionan, así que el cifrado sigue activo).
    implementation("androidx.webkit:webkit:1.11.0")
}

// Fuente única de la web app: se copia public/demo.html -> assets/index.html.
val webAppSource = rootProject.file("../public/demo.html")
val syncWebApp by tasks.registering(Copy::class) {
    onlyIf { webAppSource.exists() }
    from(webAppSource) { rename { "index.html" } }
    into(layout.projectDirectory.dir("src/main/assets"))
}
tasks.named("preBuild") { dependsOn(syncWebApp) }
