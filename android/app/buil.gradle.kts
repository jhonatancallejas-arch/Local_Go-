dependencies {
    // Retrofit & Convertidor JSON (Gson)
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")

    // OkHttp & Interceptor para ver peticiones en Logcat
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Corrutinas de Kotlin para llamadas asíncronas
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}