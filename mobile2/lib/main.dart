import 'package:flutter/material.dart';
import 'splash_screen.dart';

void main() {
  runApp(SmartPowerMeterApp());
}

class SmartPowerMeterApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Power Meter',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00D4AA), // Teal/mint green
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8F9FA),
        appBarTheme: const AppBarTheme(
          elevation: 0,
          centerTitle: true,
          backgroundColor: Colors.transparent,
          foregroundColor: Color(0xFF2C3E50),
          titleTextStyle: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Color(0xFF2C3E50),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            elevation: 0,
            backgroundColor: const Color(0xFF00D4AA),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          elevation: 0,
          backgroundColor: Colors.white,
          selectedItemColor: Color(0xFF00D4AA),
          unselectedItemColor: Color(0xFF95A5A6),
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          unselectedLabelStyle: TextStyle(fontSize: 12),
        ),
        textTheme: const TextTheme(
          headlineLarge: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Color(0xFF2C3E50),
          ),
          headlineMedium: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: Color(0xFF2C3E50),
          ),
          headlineSmall: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Color(0xFF2C3E50),
          ),
          titleLarge: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Color(0xFF2C3E50),
          ),
          titleMedium: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: Color(0xFF2C3E50),
          ),
          bodyLarge: TextStyle(
            fontSize: 16,
            color: Color(0xFF2C3E50),
          ),
          bodyMedium: TextStyle(
            fontSize: 14,
            color: Color(0xFF7F8C8D),
          ),
        ),
      ),
      home: SplashScreen(),
    );
  }
}
