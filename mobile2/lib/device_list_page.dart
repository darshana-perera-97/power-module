import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class DeviceListPage extends StatefulWidget {
  @override
  _DeviceListPageState createState() => _DeviceListPageState();
}

class _DeviceListPageState extends State<DeviceListPage> {
  List<String> deviceKeys = [];
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchDevices();
  }

  Future<void> fetchDevices() async {
    final url = Uri.parse('http://localhost:3020/firebase'); // Replace with your local IP

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        setState(() {
          deviceKeys = data.keys.toList();
          loading = false;
        });
      } else {
        setState(() {
          error = "Failed to load data: ${response.statusCode}";
          loading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = "Error: $e";
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(title: Text("Device List")),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: Text("Device List")),
        body: Center(child: Text(error!, style: TextStyle(color: Colors.red))),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text("Device List")),
      body: ListView.builder(
        itemCount: deviceKeys.length,
        itemBuilder: (context, index) {
          final key = deviceKeys[index];
          return ListTile(
            leading: Icon(Icons.device_hub),
            title: Text('Device ID: $key'),
          );
        },
      ),
    );
  }
}
