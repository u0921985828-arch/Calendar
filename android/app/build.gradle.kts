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
        versionCode = 1
        versionName = "1.0"
    }

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
    }

    buildTypes {
        getByName("debug") {
            signingConfig = signingConfigs.getByName("debug")
        }
        getByName("release") {
            isMinifyEnabled = false
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
