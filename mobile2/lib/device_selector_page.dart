import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'device_page.dart'; // adjust path if needed

class DeviceSelectorPage extends StatefulWidget {
  @override
  _DeviceSelectorPageState createState() => _DeviceSelectorPageState();
}

class _DeviceSelectorPageState extends State<DeviceSelectorPage>
    with TickerProviderStateMixin {
  static const String apiUrl = 'http://69.197.187.24:3020/firebase';

  List<String> deviceKeys = [];
  String? selectedDevice;
  bool loading = true;
  String? errorMessage;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    _init();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _init() async {
    await _loadSavedDevice();
    await _fetchDevices();
  }

  Future<void> _loadSavedDevice() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('selectedDevice');
    if (saved != null) {
      setState(() => selectedDevice = saved);
    }
  }

  Future<void> _fetchDevices() async {
    setState(() {
      loading = true;
      errorMessage = null;
    });

    try {
      final response = await http.get(Uri.parse(apiUrl));
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        setState(() {
          deviceKeys = data.keys.toList();
          loading = false;
          // If the previously saved device has disappeared, clear it
          if (selectedDevice != null && !deviceKeys.contains(selectedDevice)) {
            selectedDevice = null;
          }
        });
        _animationController.forward();
      } else {
        setState(() {
          errorMessage = 'Failed to fetch devices (${response.statusCode})';
          loading = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Connection error: Please check your internet connection';
        loading = false;
      });
    }
  }

  Future<void> _selectDevice(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('selectedDevice', key);
    setState(() => selectedDevice = key);
  }

  void _goNext() {
    if (selectedDevice == null) return;
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => 
            DevicePage(deviceKey: selectedDevice!),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(1.0, 0.0),
              end: Offset.zero,
            ).animate(CurvedAnimation(
              parent: animation,
              curve: Curves.easeInOut,
            )),
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return _buildLoading();
    if (errorMessage != null) return _buildError();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hello, Darshana!',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF2C3E50),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Select your device',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: const Color(0xFF7F8C8D),
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.more_vert),
                      onPressed: () {},
                      color: const Color(0xFF7F8C8D),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // Device Grid
                Expanded(
                  child: deviceKeys.isEmpty
                      ? _buildEmptyState()
                      : GridView.builder(
                          itemCount: deviceKeys.length,
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 16,
                            crossAxisSpacing: 16,
                            childAspectRatio: 1.1,
                          ),
                          itemBuilder: (ctx, i) {
                            final key = deviceKeys[i];
                            final isSelected = key == selectedDevice;
                            return _buildDeviceCard(key, isSelected);
                          },
                        ),
                ),

                // Continue Button
                const SizedBox(height: 24),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  child: ElevatedButton(
                    onPressed: selectedDevice == null ? null : _goNext,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: selectedDevice != null 
                          ? const Color(0xFF00D4AA)
                          : const Color(0xFFECF0F1),
                      foregroundColor: selectedDevice != null 
                          ? Colors.white
                          : const Color(0xFF95A5A6),
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Continue',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        if (selectedDevice != null) ...[
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward, size: 20),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDeviceCard(String key, bool isSelected) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      child: GestureDetector(
        onTap: () => _selectDevice(key),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected 
                  ? const Color(0xFF00D4AA)
                  : Colors.transparent,
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isSelected 
                      ? const Color(0xFF00D4AA).withOpacity(0.1)
                      : const Color(0xFFF8F9FA),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.electric_meter,
                  size: 32,
                  color: isSelected
                      ? const Color(0xFF00D4AA)
                      : const Color(0xFF7F8C8D),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Device $key',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: isSelected
                      ? const Color(0xFF00D4AA)
                      : const Color(0xFF2C3E50),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                isSelected ? 'Selected' : 'Tap to select',
                style: TextStyle(
                  fontSize: 12,
                  color: isSelected
                      ? const Color(0xFF00D4AA)
                      : const Color(0xFF95A5A6),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFFF8F9FA),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(
              Icons.devices_other,
              size: 64,
              color: const Color(0xFF95A5A6),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'No devices found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF2C3E50),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Please check your connection',
            style: TextStyle(
              fontSize: 14,
              color: const Color(0xFF7F8C8D),
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _fetchDevices,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00D4AA),
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoading() {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 60,
                height: 60,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    const Color(0xFF00D4AA),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Loading devices...',
                style: TextStyle(
                  fontSize: 16,
                  color: const Color(0xFF7F8C8D),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildError() {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 64,
                  color: const Color(0xFFE74C3C),
                ),
                const SizedBox(height: 16),
                Text(
                  'Connection Error',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF2C3E50),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  errorMessage ?? 'Unknown error occurred',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: const Color(0xFF7F8C8D),
                  ),
                ),
                const SizedBox(height: 32),
                ElevatedButton.icon(
                  onPressed: _fetchDevices,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Try Again'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00D4AA),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
