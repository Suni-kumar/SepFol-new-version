package com.sepfol.app.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

enum class SepFolTheme(val displayName: String) {
    CYBER_AMOLED("Cyber AMOLED"),
    MIDNIGHT_CYAN("Midnight Cyan"),
    EMERALD_AURORA("Emerald Aurora"),
    SUNSET_EMBER("Sunset Ember"),
    NEBULA_VIOLET("Nebula Violet"),
    FROSTED_VELVET("Frosted Velvet")
}

val AmoledBg = Color(0xFF000000)
val DarkSurface = Color(0xFF0D0E15)
val CyberPurple = Color(0xFF8B5CF6)
val CyberPink = Color(0xFFEC4899)
val CyanAccent = Color(0xFF06B6D4)
val EmeraldAccent = Color(0xFF10B981)
val SunsetAccent = Color(0xFFF97316)

private val CyberDarkColorScheme = darkColorScheme(
    primary = CyberPurple,
    secondary = CyberPink,
    tertiary = CyanAccent,
    background = AmoledBg,
    surface = DarkSurface,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color.White,
    onSurface = Color(0xFFF1F5F9)
)

private val LightColorScheme = lightColorScheme(
    primary = CyberPurple,
    secondary = CyberPink,
    tertiary = CyanAccent,
    background = Color(0xFFF8FAFC),
    surface = Color.White,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A)
)

@Composable
fun SepFolTheme(
    theme: SepFolTheme = SepFolTheme.CYBER_AMOLED,
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme || theme == SepFolTheme.CYBER_AMOLED) CyberDarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
