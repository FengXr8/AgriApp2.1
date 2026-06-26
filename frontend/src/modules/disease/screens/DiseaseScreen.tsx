import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Modal, Alert, Share, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { RecognitionResult, RecognitionHistoryItem, ControlSuggestion, DangerLevel } from '../../../domain/types';
import { recognitionService, cropService } from '../../../domain/services';

type ScreenState = 'idle' | 'loading' | 'result' | 'history';

interface DiseaseResult {
  name: string;
  confidence: string;
  level: string;
  suggestion: string;
}

interface HistoryRecord {
  id: string;
  result: DiseaseResult;
  timestamp: string;
}

export default function DiseaseScreen() {
  const [state, setState] = useState<ScreenState>('idle');
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [suggestion, setSuggestion] = useState<ControlSuggestion | null>(null);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crops, setCrops] = useState<string[]>([]);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const cropList = await cropService.getCrops();
        setCrops(cropList.map(crop => crop.name));
      } catch (error) {
        console.error('Failed to fetch crops:', error);
      }
    };
    fetchCrops();
  }, []);

  const getLevelText = (level: DangerLevel): string => {
    switch (level) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '低';
    }
  };

  const handleScan = async (type: 'camera' | 'gallery') => {
    // 清理之前的进度 interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    let imageUri: string | null = null;

    if (type === 'camera') {
      // 相机：先弹出中文预提示
      Alert.alert(
        '相机权限说明',
        '需要打开相机，用于拍摄作物病虫害图片进行识别。',
        [
          {
            text: '取消',
            style: 'cancel',
          },
          {
            text: '继续',
            onPress: async () => {
              try {
                // 请求相机权限
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                if (!cameraPermission.granted) {
                  Alert.alert('相机权限不足', '请在系统设置中开启相机权限');
                  return;
                }

                // 启动相机
                const cameraResult = await ImagePicker.launchCameraAsync({
                  mediaTypes: ['images'],
                  allowsEditing: false,
                  quality: 0.8,
                });

                // 用户取消选择
                if (cameraResult.canceled || !cameraResult.assets || cameraResult.assets.length === 0) {
                  return;
                }

                imageUri = cameraResult.assets[0].uri;
                if (imageUri) {
                  proceedWithRecognition(imageUri, type);
                }
              } catch (error) {
                console.error('Camera failed:', error);
              }
            },
          },
        ]
      );
    } else {
      // 相册：先弹出中文预提示
      Alert.alert(
        '相册权限说明',
        '需要打开相册，用于选择作物病虫害图片进行识别。',
        [
          {
            text: '取消',
            style: 'cancel',
          },
          {
            text: '继续',
            onPress: async () => {
              try {
                // 请求相册权限
                const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!libraryPermission.granted) {
                  Alert.alert('相册权限不足', '请在系统设置中开启相册权限');
                  return;
                }

                // 启动相册选择器
                const libraryResult = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsEditing: false,
                  quality: 0.8,
                });

                // 用户取消选择
                if (libraryResult.canceled || !libraryResult.assets || libraryResult.assets.length === 0) {
                  return;
                }

                imageUri = libraryResult.assets[0].uri;
                if (imageUri) {
                  proceedWithRecognition(imageUri, type);
                }
              } catch (error) {
                console.error('Gallery failed:', error);
              }
            },
          },
        ]
      );
    }
  };

  const proceedWithRecognition = (imageUri: string, type: 'camera' | 'gallery') => {
    // 保存选中的图片 URI
    setSelectedImageUri(imageUri);
    setState('loading');
    setProgress(0);

    // 启动进度模拟
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    // 调用识别服务（仍然走 Mock API）
    const source = type === 'camera' ? 'camera' : 'album';

    recognitionService.uploadImage(imageUri, source)
      .then((uploadResult) => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setProgress(100);

        // 获取识别结果
        return recognitionService.getResult(uploadResult.id);
      })
      .then((recognitionResult) => {
        if (recognitionResult) {
          const newResult: DiseaseResult = {
            name: recognitionResult.pestName,
            confidence: recognitionResult.confidence,
            level: getLevelText(recognitionResult.dangerLevel),
            suggestion: '',
          };
          setResult(newResult);

          return recognitionService.getSuggestion(recognitionResult.id)
            .then((controlSuggestion) => {
              if (controlSuggestion) {
                setSuggestion(controlSuggestion);
                newResult.suggestion = controlSuggestion.measures.join('\n') + (controlSuggestion.precautions.length > 0 ? '\n\n注意事项：\n' + controlSuggestion.precautions.join('\n') : '');
              }

              const newRecord: HistoryRecord = {
                id: recognitionResult.id,
                result: newResult,
                timestamp: new Date().toLocaleString('zh-CN'),
              };
              setHistory((prev) => [newRecord, ...prev]);
            });
        }
      })
      .then(() => {
        setState('result');
      })
      .catch((error) => {
        // 清理 interval
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        console.error('Recognition failed:', error);
        Alert.alert('识别失败', '请稍后重试');
        setProgress(0);
        setState('idle');
        setSelectedImageUri(null);
      });
  };

  const handleRetry = () => {
    setResult(null);
    setSuggestion(null);
    setProgress(0);
    setSelectedImageUri(null);
    setState('idle');
  };

  const handleBack = () => {
    setResult(null);
    setSuggestion(null);
    setProgress(0);
    setSelectedImageUri(null);
    setState('idle');
  };

  const handleSaveToCrop = () => {
    setShowCropModal(true);
  };

  const handleSelectCrop = (cropName: string) => {
    setShowCropModal(false);
    Alert.alert('保存成功', `已将识别结果保存到"${cropName}"`);
  };

  const handleShare = async () => {
    if (!result) return;

    const shareContent = `病虫害识别结果\n\n病害名称：${result.name}\n置信度：${result.confidence}\n危害等级：${result.level}\n\n防治建议：\n${result.suggestion}`;

    try {
      await Share.share({
        message: shareContent,
      });
    } catch (error) {
      Alert.alert('分享失败', '无法分享识别结果');
    }
  };

  const handleViewHistory = (record: HistoryRecord) => {
    setResult(record.result);
    setState('result');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '高':
        return '#f44336';
      case '中':
        return '#ff9800';
      case '低':
        return '#4caf50';
      default:
        return '#666';
    }
  };

  const renderIdle = () => (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📷</Text>
        </View>
        <Text style={styles.title}>病虫害识别</Text>
        <Text style={styles.description}>拍照或上传图片，AI自动识别病虫害类型</Text>

        <TouchableOpacity style={styles.scanButton} onPress={() => handleScan('camera')}>
          <Ionicons name="camera" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.scanButtonText}>拍照识别</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.galleryButton} onPress={() => handleScan('gallery')}>
          <Ionicons name="images" size={24} color="#4CAF50" style={styles.buttonIcon} />
          <Text style={styles.galleryButtonText}>从相册选择</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>识别中...</Text>
        <Text style={styles.loadingSubText}>AI正在分析图片特征</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.min(Math.round(progress), 100)}%</Text>
        </View>
      </View>
    </View>
  );

  const renderResult = () => (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultIcon}>✅</Text>
          <Text style={styles.resultTitle}>识别完成</Text>
        </View>

        {/* 图片预览 */}
        {selectedImageUri && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: selectedImageUri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>病害名称</Text>
          <Text style={styles.infoValue}>{result?.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>置信度</Text>
          <Text style={[styles.infoValue, { color: getLevelColor(result?.level || '') }]}>
            {result?.confidence}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>危害等级</Text>
          <Text style={[styles.infoValue, { color: getLevelColor(result?.level || '') }]}>
            {result?.level}
          </Text>
        </View>

        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionTitle}>防治建议</Text>
          <Text style={styles.suggestionContent}>{result?.suggestion}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>返回</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#4CAF50" />
            <Text style={[styles.secondaryButtonText, { color: '#4CAF50' }]}>分享</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleSaveToCrop}>
            <Ionicons name="save-outline" size={20} color="#4CAF50" />
            <Text style={[styles.secondaryButtonText, { color: '#4CAF50' }]}>保存到作物</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>重新识别</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHistory = () => (
    <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>识别历史</Text>
        <TouchableOpacity onPress={() => setState('idle')}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Text style={styles.emptyHistoryIcon}>📋</Text>
          <Text style={styles.emptyHistoryText}>暂无识别记录</Text>
        </View>
      ) : (
        <ScrollView style={styles.historyList}>
          {history.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.historyItem}
              onPress={() => handleViewHistory(record)}
            >
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyItemName}>{record.result.name}</Text>
                <Text style={styles.historyItemTime}>{record.timestamp}</Text>
              </View>
              <View style={styles.historyItemRight}>
                <Text style={[styles.historyItemConfidence, { color: getLevelColor(record.result.level) }]}>
                  {record.result.confidence}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.page}>
      {/* 顶部导航 */}
      {state !== 'history' && (
        <View style={styles.topNav}>
          <Text style={styles.navTitle}>病虫害识别</Text>
          <TouchableOpacity onPress={() => setState('history')} style={styles.historyButton}>
            <Ionicons name="time-outline" size={22} color="#4CAF50" />
            <Text style={styles.historyButtonText}>识别历史</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 主内容区域 */}
      {state === 'idle' && renderIdle()}
      {state === 'loading' && renderLoading()}
      {state === 'result' && renderResult()}
      {state === 'history' && renderHistory()}

      {/* 作物选择Modal */}
      <Modal
        visible={showCropModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCropModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择作物</Text>
              <TouchableOpacity onPress={() => setShowCropModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cropList}>
              {crops.map((crop) => (
                <TouchableOpacity
                  key={crop}
                  style={styles.cropItem}
                  onPress={() => handleSelectCrop(crop)}
                >
                  <Text style={styles.cropItemText}>{crop}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 30,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#E8F5E9',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  galleryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  galleryButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 4,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  loadingSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  progressContainer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  imagePreviewContainer: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  previewImage: {
    width: '100%',
    height: 180,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  suggestionBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    width: '100%',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  suggestionContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 4,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistoryIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#999',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  historyItemTime: {
    fontSize: 12,
    color: '#999',
  },
  historyItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyItemConfidence: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cropList: {
    padding: 16,
  },
  cropItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 8,
  },
  cropItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});