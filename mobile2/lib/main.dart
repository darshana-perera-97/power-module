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
        primaryColor: Color(0xFF0077B5),
        appBarTheme: AppBarTheme(backgroundColor: Color(0xFF0077B5)),
      ),
      home: SplashScreen(),
    );
  }
}
