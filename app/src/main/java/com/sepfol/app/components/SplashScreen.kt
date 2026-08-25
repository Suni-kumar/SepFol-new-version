package com.sepfol.app.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.sepfol.app.R
import com.sepfol.app.theme.GlassBox
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onSplashFinished: () -> Unit
) {
    val scale = remember { Animatable(0.6f) }
    val alpha = remember { Animatable(0f) }

    LaunchedEffect(true) {
        alpha.animateTo(1f, animationSpec = tween(600))
        scale.animateTo(
            targetValue = 1f,
            animationSpec = spring(dampingRatio = 0.45f, stiffness = 200f)
        )
        delay(1200L) // Display duration before opening main app
        onSplashFinished()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFF0F243D), Color(0xFF070F1E), Color(0xFF02060D))
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        GlassBox(
            shape = RoundedCornerShape(32.dp),
            borderColors = listOf(Color.White.copy(alpha = 0.3f), Color.White.copy(alpha = 0.05f)),
            backgroundColors = listOf(Color(0xFF1E1B2E).copy(alpha = 0.6f), Color(0xFF0D0B18).copy(alpha = 0.8f)),
            modifier = Modifier
                .size(130.dp)
                .scale(scale.value)
                .alpha(alpha.value)
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                // Uses the exact vector logo foreground
                Icon(
                    painter = painterResource(id = R.drawable.ic_launcher_foreground),
                    contentDescription = "SepFol Logo",
                    tint = Color.Unspecified,
                    modifier = Modifier.size(80.dp)
                )
            }
        }
    }
}
