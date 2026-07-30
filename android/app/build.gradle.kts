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

    buildTypes {
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
