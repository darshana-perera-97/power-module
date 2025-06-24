import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class HomePage extends StatefulWidget {
  final String? selectedDevice;

  HomePage({this.selectedDevice});

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String? selectedDevice;

  @override
  void initState() {
    super.initState();
    if (widget.selectedDevice != null) {
      selectedDevice = widget.selectedDevice;
    } else {
      loadSelectedDevice();
    }
  }

  Future<void> loadSelectedDevice() async {
    final prefs = await SharedPreferences.getInstance();
    final savedDevice = prefs.getString('selectedDevice');
    setState(() {
      selectedDevice = savedDevice;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Smart Power Meter Home'),
        backgroundColor: Color(0xFF0077B5),
      ),
      body: Center(
        child: selectedDevice == null
            ? Text(
                'No device selected',
                style: TextStyle(fontSize: 20, color: Colors.grey),
              )
            : Text(
                'Selected Device: $selectedDevice',
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
              ),
      ),
    );
  }
}
