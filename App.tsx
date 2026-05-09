import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

/** 功能模块卡片数据 */
const MODULES = [
  { id: '1', title: '设备管理', icon: '⚙️', desc: '设备状态监控' },
  { id: '2', title: '数据采集', icon: '📊', desc: '实时数据采集' },
  { id: '3', title: '质量检测', icon: '🔬', desc: '质量分析报告' },
  { id: '4', title: '生产报表', icon: '📋', desc: '生产数据统计' },
  { id: '5', title: '报警中心', icon: '🔔', desc: '异常报警处理' },
  { id: '6', title: '系统设置', icon: '🛠️', desc: '参数配置管理' },
];

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 顶部状态栏 */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>RELAI BIO</Text>
        <Text style={styles.statusTime}>在线</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 品牌区域 */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <Text style={styles.logoText}>RL</Text>
              </View>
            </View>
          </View>
          <Text style={styles.brandName}>瑞莱生物</Text>
          <Text style={styles.brandSub}>RELAI BIOTECHNOLOGY</Text>
          <View style={styles.divider} />
          <Text style={styles.version}>v1.0.0 | 生产管理系统</Text>
        </View>

        {/* 功能模块网格 */}
        <View style={styles.moduleGrid}>
          {MODULES.map((mod) => (
            <TouchableOpacity
              key={mod.id}
              style={styles.moduleCard}
              activeOpacity={0.7}
            >
              <Text style={styles.moduleIcon}>{mod.icon}</Text>
              <Text style={styles.moduleTitle}>{mod.title}</Text>
              <Text style={styles.moduleDesc}>{mod.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 底部信息 */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>系统状态</Text>
            <View style={styles.statusDot} />
            <Text style={styles.footerValue}>正常运行</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>设备连接</Text>
            <Text style={styles.footerValue}>12 台在线</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  statusText: {
    color: '#00d4aa',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  statusTime: {
    color: '#00d4aa',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  brandSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoOuter: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
  },
  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#00d4aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#0a0a0a',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 6,
  },
  brandSub: {
    color: '#666666',
    fontSize: 12,
    marginTop: 6,
    letterSpacing: 3,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#00d4aa',
    marginTop: 16,
    marginBottom: 12,
  },
  version: {
    color: '#444444',
    fontSize: 11,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  moduleCard: {
    width: '47%',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  moduleIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  moduleTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  moduleDesc: {
    color: '#666666',
    fontSize: 12,
  },
  footer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerLabel: {
    color: '#666666',
    fontSize: 13,
    width: 80,
  },
  footerValue: {
    color: '#ffffff',
    fontSize: 13,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00d4aa',
    marginRight: 8,
  },
});
