import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  StatusBar,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { decode } from './src/codec';
import { PROJECTS } from './src/projects';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showHelp, setShowHelp] = useState(false);
  const [scanResult, setScanResult] = useState<{
    projectName: string;
    projectId: number;
    lot: number;
  } | null>(null);
  const [scanned, setScanned] = useState(false);
  const scannedRef = useRef(false);
  const focusingRef = useRef(false);
  const [cameraLayout, setCameraLayout] = useState({ width: 0, height: 0 });
  const [autofocus, setAutofocus] = useState(false);

  // 判断条码中心是否在扫码框内
  const isWithinScanFrame = useCallback((result: BarcodeScanningResult): boolean => {
    if (cameraLayout.width === 0 || cameraLayout.height === 0) return true;
    const { bounds } = result;
    if (!bounds || bounds.size.width === 0 || bounds.size.height === 0) return true;

    const SCAN_FRAME = 240;
    const frameLeft = (cameraLayout.width - SCAN_FRAME) / 2;
    const frameTop = (cameraLayout.height - SCAN_FRAME) / 2;

    const cx = bounds.origin.x + bounds.size.width / 2;
    const cy = bounds.origin.y + bounds.size.height / 2;

    return (
      cx >= frameLeft &&
      cx <= frameLeft + SCAN_FRAME &&
      cy >= frameTop &&
      cy <= frameTop + SCAN_FRAME
    );
  }, [cameraLayout]);

  const handleBarCodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (scannedRef.current) return;
      // 忽略扫码框外的条码
      if (!isWithinScanFrame(result)) return;
      scannedRef.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const decoded = decode(result.data);
      if (!decoded) {
        Alert.alert('扫码结果', '无法识别的 DataMatrix 码', [
          { text: '确定', onPress: () => { scannedRef.current = false; } },
        ]);
        return;
      }
      const [id, lot] = decoded;
      const project = PROJECTS.find((p) => p.id === id);
      setScanned(true);
      setScanResult({
        projectName: project?.name ?? `未知项目(${id})`,
        projectId: id,
        lot,
      });
    },
    [isWithinScanFrame]
  );

  // 点击画面触发对焦
  const handleCameraPress = useCallback(() => {
    if (focusingRef.current) return;
    focusingRef.current = true;
    setAutofocus(true);
    setTimeout(() => {
      setAutofocus(false);
      focusingRef.current = false;
    }, 1000);
  }, []);

  const handleCameraLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCameraLayout({ width, height });
  }, []);

  const handleContinue = useCallback(() => {
    setScanResult(null);
    setScanned(false);
    scannedRef.current = false;
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relia</Text>
        <TouchableOpacity onPress={() => setShowHelp(true)} style={styles.helpBtn}>
          <Text style={styles.helpBtnText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* 扫码页 */}
      <View style={styles.page}>
        {!permission?.granted ? (
          <View style={styles.permScreen}>
            <Text style={styles.permTitle}>需要相机权限</Text>
            <Text style={styles.permDesc}>扫码功能需要使用相机，请授权后继续</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
              <Text style={styles.primaryBtnText}>授权相机</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cameraWrapper} onLayout={handleCameraLayout}>
              <CameraView
                style={styles.cameraView}
                autofocus={autofocus ? 'on' : 'off'}
                barcodeScannerSettings={{ barcodeTypes: ['datamatrix'] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
            </View>
            <Pressable style={styles.touchOverlay} onPress={handleCameraPress} />
            <View style={styles.scanOverlay} pointerEvents="none">
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <Text style={styles.scanHint}>将试剂 DataMatrix 码放入框内</Text>
            </View>
            {scanResult && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>扫码结果</Text>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>项目</Text>
                  <Text style={styles.resultValue} selectable>
                    {scanResult.projectName}（{scanResult.projectId}）
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>批号</Text>
                  <Text style={styles.resultValue} selectable>
                    {scanResult.lot}
                  </Text>
                </View>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
                  <Text style={styles.primaryBtnText}>继续扫码</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* 帮助 */}
      {showHelp && (
        <View style={styles.modalOverlay}>
          <View style={styles.helpModal}>
            <Text style={styles.helpTitle}>Relia 试剂扫码工具</Text>
            <Text style={styles.helpBody} selectable>
              用于瑞莱生物试剂的 DataMatrix 码管理：{'\n\n'}
              扫描试剂包装上的 DataMatrix 二维码，自动解析出检测项目名称和批号。{'\n\n'}
              所有 DataMatrix 码均使用标准 ECC200 编码。
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowHelp(false)}>
              <Text style={styles.primaryBtnText}>知道了</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const ACCENT = '#2563eb';
const BG = '#ffffff';
const BORDER = '#e2e8f0';
const TEXT = '#1e293b';
const MUTED = '#94a3b8';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT,
    letterSpacing: 1,
  },
  helpBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  page: {
    flex: 1,
  },
  cameraWrapper: {
    flex: 1,
  },
  cameraView: {
    flex: 1,
  },
  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: ACCENT,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  scanHint: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  resultCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: BG,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: { fontSize: 14, color: MUTED },
  resultValue: { fontSize: 15, fontWeight: '600', color: TEXT },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 100,
  },
  helpModal: {
    backgroundColor: BG,
    borderRadius: 20,
    margin: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 16,
    textAlign: 'center',
  },
  helpBody: { fontSize: 14, color: TEXT, lineHeight: 22, marginBottom: 20 },
  helpBold: { fontWeight: '700', color: ACCENT },
  permScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 12,
  },
  permDesc: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
});
