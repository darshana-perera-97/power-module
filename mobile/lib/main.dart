import 'package:flutter/material.dart';
import 'splash_screen.dart';
import 'home_page.dart';

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
        primaryColor: Color(0xFF0077B5),
        scaffoldBackgroundColor: Colors.white,
      ),
      home: SplashScreen(),
    );
  }
}
