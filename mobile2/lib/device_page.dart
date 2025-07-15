import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';

class DevicePage extends StatefulWidget {
  final String deviceKey;
  const DevicePage({Key? key, required this.deviceKey}) : super(key: key);

  @override
  State<DevicePage> createState() => _DevicePageState();
}

class _DevicePageState extends State<DevicePage>
    with TickerProviderStateMixin {
  int _currentIndex = 0;
  Map<String, dynamic>? deviceData, cebData;
  List<Map<String, dynamic>> deviceHistory = [];
  bool _historyLoaded = false;
  String? error;
  Timer? _timer;
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));
    
    _refreshAll();
    _timer = Timer.periodic(const Duration(seconds: 3), (_) => _refreshAll());
    _fadeController.forward();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _fadeController.dispose();
    super.dispose();
  }

  Future<void> _refreshAll() async {
    // Load current data first (faster)
    await _fetchData();
    // Load history data in background (slower, but non-blocking)
    _fetchHistoryInBackground();
  }

  Future<void> _fetchData() async {
    try {
      final devR = await http.get(
        Uri.parse(
          'http://69.197.187.24:3020/currentState?device=${widget.deviceKey}',
        ),
      );
      final cebR = await http.get(Uri.parse('http://69.197.187.24:3020/cebData'));
      if (devR.statusCode == 200 && cebR.statusCode == 200) {
        setState(() {
          deviceData = json.decode(devR.body);
          cebData = json.decode(cebR.body);
          error = null;
        });
      } else {
        setState(
          () => error = 'Server error: ${devR.statusCode} & ${cebR.statusCode}',
        );
      }
    } catch (e) {
      setState(() => error = 'Connection error: Please check your internet connection');
    }
  }

  Future<void> _fetchHistoryInBackground() async {
    // Don't set loading state if we're already loading
    if (!_historyLoaded) {
      setState(() {
        _historyLoaded = false; // Ensure loading state is shown
      });
    }

    try {
      final r = await http.get(
        Uri.parse('http://69.197.187.24:3020/pastData?device=${widget.deviceKey}'),
      );
      if (r.statusCode == 200) {
        setState(() {
          deviceHistory = List<Map<String, dynamic>>.from(json.decode(r.body));
          _historyLoaded = true;
        });
      } else {
        setState(() {
          _historyLoaded = true;
        });
      }
    } catch (_) {
      setState(() {
        _historyLoaded = true;
      });
    }
  }

  Future<void> _fetchHistory() async {
    // This method is kept for backward compatibility but now calls the background version
    await _fetchHistoryInBackground();
  }

  double _calcCost() {
    if (deviceData == null || cebData == null) return 0;
    final p =
        double.tryParse('${deviceData!['data']?['totalpower'] ?? 0}') ?? 0;
    final ranges = List<String>.from(cebData!['ranges'] ?? []);
    final costs = cebData!['monthlyCost'] as List<dynamic>;
    final units = cebData!['unitPrice'] as List<dynamic>;
    for (var i = 0; i < ranges.length; i++) {
      final parts = ranges[i]
          .split('-')
          .map((s) => double.tryParse(s) ?? 0)
          .toList();
      if (parts.length == 2 && p >= parts[0] && p <= parts[1]) {
        return (costs[i] + units[i] * p).toDouble();
      }
    }
    if (ranges.isNotEmpty) {
      final last = ranges.length - 1;
      return (costs[last] + units[last] * p).toDouble();
    }
    return 0;
  }

  // --- Greeting Helpers ---
  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 20) return 'Good Evening';
    return 'Good Night';
  }

  Widget _greeting() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
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
                _getGreeting(),
                style: TextStyle(
                  fontSize: 16,
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
    );
  }
  // --- END Greeting Helpers ---

  Widget _metricCard({
    required String title,
    required String value,
    required IconData icon,
    Color? iconColor,
    Color? valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (iconColor ?? const Color(0xFF00D4AA)).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  size: 20,
                  color: iconColor ?? const Color(0xFF00D4AA),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF7F8C8D),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: valueColor ?? const Color(0xFF2C3E50),
            ),
          ),
        ],
      ),
    );
  }

  Widget _loading() => Center(
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
        const SizedBox(height: 16),
        Text(
          'Loading data...',
          style: TextStyle(
            fontSize: 16,
            color: const Color(0xFF7F8C8D),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    ),
  );

  Widget _error() => Center(
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
            error ?? 'Unknown error occurred',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: const Color(0xFF7F8C8D),
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _refreshAll,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00D4AA),
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    ),
  );

  Widget _homeTab() {
    if (error != null) return _error();
    if (deviceData == null || cebData == null) return _loading();

    final data = deviceData!['data'] as Map<String, dynamic>;
    final cost = _calcCost();

    return FadeTransition(
      opacity: _fadeAnimation,
      child: ListView(
        padding: const EdgeInsets.symmetric(vertical: 20),
        children: [
          _greeting(),
          
          // Main Balance Card (like portfolio)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF00D4AA),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Estimated Cost',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withOpacity(0.9),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Rs. ${cost.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Current power consumption',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.8),
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Power Usage Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Power Usage',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF2C3E50),
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: const Color(0xFF7F8C8D),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(
                child: _metricCard(
                  title: 'Live Power',
                  value: '${data['livepower'] ?? '-'} W',
                  icon: Icons.flash_on,
                  iconColor: const Color(0xFFF39C12),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _metricCard(
                  title: 'Total Power',
                  value: '${data['totalpower'] ?? '-'} W',
                  icon: Icons.power,
                  iconColor: const Color(0xFF3498DB),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // Current Quality Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Current Quality',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF2C3E50),
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: const Color(0xFF7F8C8D),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(
                child: _metricCard(
                  title: 'Current',
                  value: '${data['current'] ?? '-'} A',
                  icon: Icons.electric_bolt,
                  iconColor: const Color(0xFF9B59B6),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _metricCard(
                  title: 'Voltage',
                  value: '${data['voltage'] ?? '-'} V',
                  icon: Icons.bolt,
                  iconColor: const Color(0xFFE74C3C),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _deviceTab() {
    if (error != null) return _error();
    if (deviceData == null) return _loading();

    final d = deviceData!['data'] as Map<String, dynamic>;
    final active = deviceData!['deviceStatus'] == true;

    return FadeTransition(
      opacity: _fadeAnimation,
      child: ListView(
        padding: const EdgeInsets.symmetric(vertical: 20),
        children: [
          _greeting(),
          
          // Device Status Card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: active 
                        ? const Color(0xFF00D4AA).withOpacity(0.1)
                        : const Color(0xFFE74C3C).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    active ? Icons.check_circle : Icons.error,
                    size: 48,
                    color: active ? const Color(0xFF00D4AA) : const Color(0xFFE74C3C),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Device Status',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF7F8C8D),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  active ? '🟢 Active' : '🔴 Inactive',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: active ? const Color(0xFF00D4AA) : const Color(0xFFE74C3C),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Device Info Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Device Information',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF2C3E50),
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: const Color(0xFF7F8C8D),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(
                child: _metricCard(
                  title: 'Battery Level',
                  value: '${d['battery'] ?? '-'}%',
                  icon: Icons.battery_full,
                  iconColor: const Color(0xFF00D4AA),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _metricCard(
                  title: 'Device ID',
                  value: '${d['device'] ?? '-'}',
                  icon: Icons.devices,
                  iconColor: const Color(0xFF3498DB),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _analyticsTab() {
    if (error != null) return _error();
    if (!_historyLoaded) return _buildAnalyticsLoading();

    return FadeTransition(
      opacity: _fadeAnimation,
      child: ListView(
        padding: const EdgeInsets.symmetric(vertical: 20),
        children: [
          _greeting(),
          
          // Analytics Overview
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Analytics Overview',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF2C3E50),
                      ),
                    ),
                    Icon(
                      Icons.analytics,
                      color: const Color(0xFF00D4AA),
                      size: 24,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  'Historical data analysis for your power consumption',
                  style: TextStyle(
                    fontSize: 14,
                    color: const Color(0xFF7F8C8D),
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Power Usage Chart
          _buildChartSection(
            title: 'Power Usage Trend',
            subtitle: 'Live and Total Power over time',
            icon: Icons.flash_on,
            iconColor: const Color(0xFFF39C12),
            chart: _buildPowerChart(),
          ),
          
          const SizedBox(height: 20),
          
          // Current Chart
          _buildChartSection(
            title: 'Current Trend',
            subtitle: 'Electrical current over time',
            icon: Icons.electric_bolt,
            iconColor: const Color(0xFF9B59B6),
            chart: _buildCurrentChart(),
          ),
          
          const SizedBox(height: 20),
          
          // Voltage Chart
          _buildChartSection(
            title: 'Voltage Trend',
            subtitle: 'Voltage levels over time',
            icon: Icons.bolt,
            iconColor: const Color(0xFFE74C3C),
            chart: _buildVoltageChart(),
          ),
          
          const SizedBox(height: 20),
          
          // Cost Chart
          _buildChartSection(
            title: 'Cost Analysis',
            subtitle: 'Estimated costs over time',
            icon: Icons.attach_money,
            iconColor: const Color(0xFF00D4AA),
            chart: _buildCostChart(),
          ),
          
          const SizedBox(height: 20),
          
          // Data Table Section
          _buildDataTableSection(),
          
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildChartSection({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    required Widget chart,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  size: 20,
                  color: iconColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF2C3E50),
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: const Color(0xFF7F8C8D),
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 200,
            child: chart,
          ),
        ],
      ),
    );
  }

  Widget _buildPowerChart() {
    if (deviceHistory.isEmpty) return _buildEmptyChart();
    
    final powerData = deviceHistory.map((entry) {
      final time = DateTime.parse(entry['time']);
      final livePower = double.tryParse(entry['livepower']?.toString() ?? '0') ?? 0;
      return FlSpot(time.millisecondsSinceEpoch.toDouble(), livePower);
    }).toList();
    
    final totalPowerData = deviceHistory.map((entry) {
      final time = DateTime.parse(entry['time']);
      final totalPower = double.tryParse(entry['totalpower']?.toString() ?? '0') ?? 0;
      return FlSpot(time.millisecondsSinceEpoch.toDouble(), totalPower);
    }).toList();

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: true,
          horizontalInterval: 100,
          verticalInterval: 1,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: const Color(0xFFE8E8E8),
              strokeWidth: 1,
            );
          },
          getDrawingVerticalLine: (value) {
            return FlLine(
              color: const Color(0xFFE8E8E8),
              strokeWidth: 1,
            );
          },
        ),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              interval: 1,
              getTitlesWidget: (double value, TitleMeta meta) {
                final date = DateTime.fromMillisecondsSinceEpoch(value.toInt());
                return SideTitleWidget(
                  axisSide: meta.axisSide,
                  child: Text(
                    DateFormat('HH:mm').format(date),
                    style: TextStyle(
                      color: const Color(0xFF7F8C8D),
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 100,
              getTitlesWidget: (double value, TitleMeta meta) {
                return Text(
                  '${value.toInt()}W',
                  style: TextStyle(
                    color: const Color(0xFF7F8C8D),
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                );
              },
              reservedSize: 42,
            ),
          ),
        ),
        borderData: FlBorderData(
          show: true,
          border: Border.all(color: const Color(0xFFE8E8E8)),
        ),
        minX: powerData.isNotEmpty ? powerData.first.x : 0,
        maxX: powerData.isNotEmpty ? powerData.last.x : 1,
        minY: 0,
        maxY: powerData.isNotEmpty ? powerData.map((e) => e.y).reduce((a, b) => a > b ? a : b) * 1.1 : 100,
        lineBarsData: [
          LineChartBarData(
            spots: powerData,
            isCurved: true,
            gradient: LinearGradient(
              colors: [
                const Color(0xFFF39C12),
                const Color(0xFFF39C12).withOpacity(0.5),
              ],
            ),
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  const Color(0xFFF39C12).withOpacity(0.3),
                  const Color(0xFFF39C12).withOpacity(0.1),
                ],
              ),
            ),
          ),
          LineChartBarData(
            spots: totalPowerData,
            isCurved: true,
            gradient: LinearGradient(
              colors: [
                const Color(0xFF3498DB),
                const Color(0xFF3498DB).withOpacity(0.5),
              ],
            ),
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF3498DB).withOpacity(0.3),
                  const Color(0xFF3498DB).withOpacity(0.1),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentChart() {
    if (deviceHistory.isEmpty) return _buildEmptyChart();
    
    final currentData = deviceHistory.map((entry) {
      final time = DateTime.parse(entry['time']);
      final current = double.tryParse(entry['current']?.toString() ?? '0') ?? 0;
      return FlSpot(time.millisecondsSinceEpoch.toDouble(), current);
    }).toList();

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: true,
          horizontalInterval: 1,
          verticalInterval: 1,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: const Color(0xFFE8E8E8),
              strokeWidth: 1,
            );
          },
          getDrawingVerticalLine: (value) {
            return FlLine(
              color: const Color(0xFFE8E8E8),
              strokeWidth: 1,
            );
          },
        ),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              interval: 1,
              getTitlesWidget: (double value, TitleMeta meta) {
                final date = DateTime.fromMillisecondsSinceEpoch(value.toInt());
                return SideTitleWidget(
                  axisSide: meta.axisSide,
                  child: Text(
                    DateFormat('HH:mm').format(date),
                    style: TextStyle(
                      color: const Color(0xFF7F8C8D),
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 1,
              getTitlesWidget: (double value, TitleMeta meta) {
                return Text(
                  '${value.toStringAsFixed(1)}A',
                  style: TextStyle(
                    color: const Color(0xFF7F8C8D),
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                );
              },
              reservedSize: 42,
            ),
          ),
        ),
        borderData: FlBorderData(
          show: true,
          border: Border.all(color: const Color(0xFFE8E8E8)),
        ),
        minX: currentData.isNotEmpty ? currentData.first.x : 0,
        maxX: currentData.isNotEmpty ? currentData.last.x : 1,
        minY: 0,
        maxY: currentData.isNotEmpty ? currentData.map((e) => e.y).reduce((a, b) => a > b ? a : b) * 1.1 : 10,
        lineBarsData: [
          LineChartBarData(
            spots: currentData,
            isCurved: true,
            gradient: LinearGradient(
              colors: [
                const Color(0xFF9B59B6),
                const Color(0xFF9B59B6).withOpacity(0.5),
              ],
            ),
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF9B59B6).withOpacity(0.3),
                  const Color(0xFF9B59B6).withOpacity(0.1),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVoltageChart() {
    if (deviceHistory.isEmpty) return _buildEmptyChart();
    
    final voltageData = deviceHistory.map((entry) {
      final time = DateTime.parse(entry['time']);
      final voltage = double.tryParse(entry['voltage']?.toString() ?? '0') ?? 0;
      return FlSpot(time.millisecondsSinceEpoch.toDouble(), voltage);
    }).toList();

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: true,
          horizontalInterval: 10,
          verticalInterval: 1,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: const Color(0xFFE8E8E8),
              strokeWidth: 1,
            );
          },
          getDrawingVerticalLine: (value) {
            return FlLine(
              color: const Color(0xFFE8E8E8),
              strokeWidth: 1,
            );
          },
        ),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              interval: 1,
              getTitlesWidget: (double value, TitleMeta meta) {
                final date = DateTime.fromMillisecondsSinceEpoch(value.toInt());
                return SideTitleWidget(
                  axisSide: meta.axisSide,
                  child: Text(
                    DateFormat('HH:mm').format(date),
                    style: TextStyle(
                      color: const Color(0xFF7F8C8D),
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 10,
              getTitlesWidget: (double value, TitleMeta meta) {
                return Text(
                  '${value.toInt()}V',
                  style: TextStyle(
                    color: const Color(0xFF7F8C8D),
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                );
              },
              reservedSize: 42,
            ),
          ),
        ),
        borderData: FlBorderData(
          show: true,
          border: Border.all(color: const Color(0xFFE8E8E8)),
        ),
        minX: voltageData.isNotEmpty ? voltageData.first.x : 0,
        maxX: voltageData.isNotEmpty ? voltageData.last.x : 1,
        minY: 0,
        maxY: voltageData.isNotEmpty ? voltageData.map((e) => e.y).reduce((a, b) => a > b ? a : b) * 1.1 : 250,
        lineBarsData: [
          LineChartBarData(
            spots: voltageData,
            isCurved: true,
            gradient: LinearGradient(
              colors: [
                const Color(0xFFE74C3C),
                const Color(0xFFE74C3C).withOpacity(0.5),
              ],
            ),
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  const Color(0xFFE74C3C).withOpacity(0.3),
                  const Color(0xFFE74C3C).withOpacity(0.1),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCostChart() {
    if (deviceHistory.isEmpty) return _buildEmptyChart();
    
    final costData = deviceHistory.map((entry) {
      final time = DateTime.parse(entry['time']);
      final costValue = entry['calculatedCost'];
      final cost = costValue is num ? costValue.toDouble() : 0.0;
      return FlSpot(time.millisecondsSinceEpoch.toDouble(), cost);
    }).toList();

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: true,
          horizontalInterval: 10,
          verticalInterval: 1,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: const Color(0xFFE8E8E8),
              strokeWidth: 1,
            );
          },
          getDrawingVerticalLine: (value) {
            return FlLine(
              color: const Color(0xFFE8E8E8),
              strokeWidth: 1,
            );
          },
        ),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              interval: 1,
              getTitlesWidget: (double value, TitleMeta meta) {
                final date = DateTime.fromMillisecondsSinceEpoch(value.toInt());
                return SideTitleWidget(
                  axisSide: meta.axisSide,
                  child: Text(
                    DateFormat('HH:mm').format(date),
                    style: TextStyle(
                      color: const Color(0xFF7F8C8D),
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 10,
              getTitlesWidget: (double value, TitleMeta meta) {
                return Text(
                  'Rs.${value.toInt()}',
                  style: TextStyle(
                    color: const Color(0xFF7F8C8D),
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                );
              },
              reservedSize: 42,
            ),
          ),
        ),
        borderData: FlBorderData(
          show: true,
          border: Border.all(color: const Color(0xFFE8E8E8)),
        ),
        minX: costData.isNotEmpty ? costData.first.x : 0,
        maxX: costData.isNotEmpty ? costData.last.x : 1,
        minY: 0,
        maxY: costData.isNotEmpty ? costData.map((e) => e.y).reduce((a, b) => a > b ? a : b) * 1.1 : 100,
        lineBarsData: [
          LineChartBarData(
            spots: costData,
            isCurved: true,
            gradient: LinearGradient(
              colors: [
                const Color(0xFF00D4AA),
                const Color(0xFF00D4AA).withOpacity(0.5),
              ],
            ),
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF00D4AA).withOpacity(0.3),
                  const Color(0xFF00D4AA).withOpacity(0.1),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyChart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.show_chart,
            size: 48,
            color: const Color(0xFF95A5A6),
          ),
          const SizedBox(height: 16),
          Text(
            'No data available',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF2C3E50),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Chart will appear when data is available',
            style: TextStyle(
              fontSize: 12,
              color: const Color(0xFF7F8C8D),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDataTableSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Detailed Data',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF2C3E50),
                ),
              ),
              Icon(
                Icons.table_chart,
                color: const Color(0xFF00D4AA),
                size: 24,
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 300,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Scrollbar(
                thumbVisibility: true,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Scrollbar(
                    thumbVisibility: true,
                    notificationPredicate: (notif) => notif.depth == 1,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.vertical,
                      child: DataTable(
                        headingTextStyle: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF2C3E50),
                        ),
                        dataTextStyle: TextStyle(
                          color: const Color(0xFF2C3E50),
                        ),
                        columns: const [
                          DataColumn(label: Text('Time')),
                          DataColumn(label: Text('Status')),
                          DataColumn(label: Text('Battery (%)')),
                          DataColumn(label: Text('Current (A)')),
                          DataColumn(label: Text('Live Power (W)')),
                          DataColumn(label: Text('Total Power (W)')),
                          DataColumn(label: Text('Voltage (V)')),
                          DataColumn(label: Text('Cost')),
                        ],
                        rows: deviceHistory.map((entry) {
                          final time = DateFormat('HH:mm').format(DateTime.parse(entry['time']));
                          final status = entry['status']?.toString() ?? '-';
                          final battery = entry['battery']?.toString() ?? '-';
                          final current = entry['current']?.toString() ?? '-';
                          final livepower = entry['livepower']?.toString() ?? '-';
                          final totalpower = entry['totalpower']?.toString() ?? '-';
                          final voltage = entry['voltage']?.toString() ?? '-';
                          final costValue = entry['calculatedCost'];
                          final cost = costValue is num
                              ? costValue.toDouble().toStringAsFixed(2)
                              : costValue?.toString() ?? '-';

                          return DataRow(
                            cells: [
                              DataCell(Text(time)),
                              DataCell(Text(status)),
                              DataCell(Text(battery)),
                              DataCell(Text(current)),
                              DataCell(Text(livepower)),
                              DataCell(Text(totalpower)),
                              DataCell(Text(voltage)),
                              DataCell(Text(cost)),
                            ],
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnalyticsLoading() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: Column(
        children: [
          _greeting(),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00D4AA).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Icon(
                        Icons.analytics,
                        size: 64,
                        color: const Color(0xFF00D4AA),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Loading Analytics',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF2C3E50),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Fetching historical data...',
                      style: TextStyle(
                        fontSize: 14,
                        color: const Color(0xFF7F8C8D),
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: 40,
                      height: 40,
                      child: CircularProgressIndicator(
                        strokeWidth: 3,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          const Color(0xFF00D4AA),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'This may take a few moments',
                      style: TextStyle(
                        fontSize: 12,
                        color: const Color(0xFF95A5A6),
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() {
                          _historyLoaded = false;
                        });
                        _fetchHistoryInBackground();
                      },
                      icon: const Icon(Icons.refresh),
                      label: const Text('Refresh'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00D4AA),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _profileTab() {
    if (error != null) return _error();
    if (deviceData == null) return _loading();

    final id = deviceData!['data']?['device'] ?? widget.deviceKey;

    return FadeTransition(
      opacity: _fadeAnimation,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _greeting(),
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundImage: NetworkImage('https://i.pravatar.cc/150?u=$id'),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      "Device ID: $id",
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF2C3E50),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Smart Power Meter",
                      style: TextStyle(
                        fontSize: 14,
                        color: const Color(0xFF7F8C8D),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyAnalytics() {
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
              Icons.analytics_outlined,
              size: 64,
              color: const Color(0xFF95A5A6),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'No Analytics Data',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF2C3E50),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Historical data will appear here',
            style: TextStyle(
              fontSize: 14,
              color: const Color(0xFF7F8C8D),
              fontWeight: FontWeight.w400,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              setState(() {
                _historyLoaded = false;
              });
              _fetchHistoryInBackground();
            },
            icon: const Icon(Icons.refresh),
            label: const Text('Refresh Data'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00D4AA),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [_homeTab(), _deviceTab(), _analyticsTab(), _profileTab()];

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text("Smart Power Meter"),
        elevation: 0,
        backgroundColor: const Color(0xFFF8F9FA),
        foregroundColor: const Color(0xFF2C3E50),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshAll,
            tooltip: 'Refresh',
            color: const Color(0xFF7F8C8D),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: pages[_currentIndex],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          elevation: 0,
          backgroundColor: Colors.white,
          selectedItemColor: const Color(0xFF00D4AA),
          unselectedItemColor: const Color(0xFF95A5A6),
          onTap: (i) => setState(() => _currentIndex = i),
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: "Home",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.devices_outlined),
              activeIcon: Icon(Icons.devices),
              label: "Device",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.analytics_outlined),
              activeIcon: Icon(Icons.analytics),
              label: "Analytics",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: "Profile",
            ),
          ],
        ),
      ),
    );
  }
}
