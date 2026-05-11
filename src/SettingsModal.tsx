import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import type { Project } from './projects';

const ACCENT = '#2563eb';
const BG = '#ffffff';
const BORDER = '#e2e8f0';
const TEXT = '#1e293b';
const MUTED = '#94a3b8';
const DANGER = '#ef4444';
const ROW_HEIGHT = 42;

interface Props {
  visible: boolean;
  projects: Project[];
  onSave: (projects: Project[]) => Promise<void>;
  onClose: () => void;
}

export default function SettingsModal({ visible, projects, onSave, onClose }: Props) {
  const [editing, setEditing] = useState<Project[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [needSave, setNeedSave] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const listRef = useRef<FlatList<Project>>(null);

  // 监听键盘
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // 键盘弹起后滚动到编辑项
      if (editIndex !== null) {
        setTimeout(() => {
          // 精确偏移：编辑行位于列表可视区顶部
          listRef.current?.scrollToOffset({
            offset: editIndex * ROW_HEIGHT,
            animated: true,
          });
        }, 300);
      }
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [editIndex]);

  // visible 变为 true 时重置内部状态
  useEffect(() => {
    if (visible) {
      setEditing(projects.map((p) => ({ ...p })));
      setEditIndex(null);
      setShowAdd(false);
      setNewId('');
      setNewName('');
      setNeedSave(false);
      setKeyboardHeight(0);
    }
  }, [visible, projects]);

  const startEdit = useCallback(
    (index: number) => {
      setEditIndex(index);
      setEditId(String(editing[index].id));
      setEditName(editing[index].name);
    },
    [editing]
  );

  const confirmEdit = useCallback(() => {
    if (editIndex === null) return;
    const id = Number(editId);
    if (isNaN(id) || id <= 0 || !editName.trim()) {
      Alert.alert('校验失败', 'ID 必须为正整数，名称不能为空');
      return;
    }
    const dup = editing.find((p, i) => i !== editIndex && p.id === id);
    if (dup) {
      Alert.alert('校验失败', `ID ${id} 已存在`);
      return;
    }
    const next = [...editing];
    next[editIndex] = { id, name: editName.trim() };
    setEditing(next);
    setEditIndex(null);
    setNeedSave(true);
  }, [editIndex, editId, editName, editing]);

  const cancelEdit = useCallback(() => {
    setEditIndex(null);
  }, []);

  const handleDelete = useCallback(
    (index: number) => {
      const item = editing[index];
      Alert.alert('确认删除', `确定要删除「${item.name}」（ID: ${item.id}）吗？`, [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            const next = editing.filter((_, i) => i !== index);
            setEditing(next);
            if (editIndex === index) setEditIndex(null);
            setNeedSave(true);
          },
        },
      ]);
    },
    [editing, editIndex]
  );

  const handleShowAdd = useCallback(() => {
    setShowAdd(true);
    // 滚动到底部
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, []);

  const handleAdd = useCallback(() => {
    const id = Number(newId);
    if (isNaN(id) || id <= 0 || !newName.trim()) {
      Alert.alert('校验失败', 'ID 必须为正整数，名称不能为空');
      return;
    }
    if (editing.find((p) => p.id === id)) {
      Alert.alert('校验失败', `ID ${id} 已存在`);
      return;
    }
    setEditing([...editing, { id, name: newName.trim() }]);
    setNewId('');
    setNewName('');
    setShowAdd(false);
    setNeedSave(true);
  }, [newId, newName, editing]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(editing);
      setNeedSave(false);
    } catch {
      Alert.alert('保存失败', '无法写入数据，请重试');
    } finally {
      setSaving(false);
    }
  }, [editing, onSave]);

  if (!visible) return null;

  // 键盘弹起时缩小列表高度
  const listMaxHeight = keyboardHeight > 0 ? 140 : 360;

  const renderItem = ({ item, index }: { item: Project; index: number }) => {
    const isEditing = editIndex === index;

    if (isEditing) {
      return (
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={editId}
            onChangeText={setEditId}
            keyboardType="numeric"
            placeholder="ID"
            placeholderTextColor={MUTED}
            autoFocus
          />
          <TextInput
            style={[styles.input, styles.inputName]}
            value={editName}
            onChangeText={setEditName}
            placeholder="名称"
            placeholderTextColor={MUTED}
          />
          <TouchableOpacity style={styles.actionBtn} onPress={confirmEdit}>
            <Text style={styles.confirmBtnText}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={cancelEdit}>
            <Text style={styles.cancelBtnText}>✗</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.row}>
        <Text style={styles.idText}>{item.id}</Text>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.name}
        </Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => startEdit(index)}>
          <Text style={styles.editBtnText}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(index)}>
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.modalWrapper}
      >
        <View style={styles.modal}>
          {/* 标题栏 */}
          <View style={styles.header}>
            <Text style={styles.title}>项目管理</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 列标题 */}
          <View style={styles.columnHeader}>
            <Text style={styles.colId}>ID</Text>
            <Text style={styles.colName}>名称</Text>
            <View style={styles.colActions} />
          </View>

          {/* 列表 */}
          <FlatList
            ref={listRef}
            data={editing}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            style={[styles.list, { maxHeight: listMaxHeight }]}
            showsVerticalScrollIndicator={false}
          />

          {/* 添加表单 */}
          {showAdd ? (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                value={newId}
                onChangeText={setNewId}
                keyboardType="numeric"
                placeholder="ID"
                placeholderTextColor={MUTED}
              />
              <TextInput
                style={[styles.input, styles.inputName]}
                value={newName}
                onChangeText={setNewName}
                placeholder="名称"
                placeholderTextColor={MUTED}
              />
              <TouchableOpacity style={styles.addConfirmBtn} onPress={handleAdd}>
                <Text style={styles.addConfirmText}>添加</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={handleShowAdd}>
              <Text style={styles.addBtnText}>+ 新增项目</Text>
            </TouchableOpacity>
          )}

          {/* 保存 */}
          <TouchableOpacity
            style={[styles.saveBtn, (!needSave || saving) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!needSave || saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? '保存中...' : needSave ? '💾 保存更改' : '已是最新'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 100,
  },
  modalWrapper: {
    margin: 16,
    maxHeight: '85%',
  },
  modal: {
    backgroundColor: BG,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '600',
  },
  columnHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 4,
  },
  colId: {
    width: 52,
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
  },
  colName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
  },
  colActions: {
    width: 72,
  },
  list: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    minHeight: ROW_HEIGHT,
  },
  idText: {
    width: 52,
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
  },
  nameText: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
  },
  input: {
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    color: TEXT,
    width: 52,
  },
  inputName: {
    flex: 1,
    marginHorizontal: 6,
    width: undefined,
  },
  actionBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 14,
    color: ACCENT,
  },
  deleteBtnText: {
    fontSize: 14,
  },
  confirmBtnText: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '700',
  },
  cancelBtnText: {
    fontSize: 16,
    color: DANGER,
    fontWeight: '700',
  },
  addBtn: {
    borderWidth: 1,
    borderColor: ACCENT,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  addBtnText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '600',
  },
  addForm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  addConfirmBtn: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addConfirmText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnDisabled: {
    backgroundColor: MUTED,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
