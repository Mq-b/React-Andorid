import * as FileSystem from 'expo-file-system/legacy';
import type { Project } from './projects';
import DEFAULT_PROJECTS from '../assets/projects.json';

const FILENAME = 'projects.json';
const FILE_URI = FileSystem.documentDirectory + FILENAME;

/** 确保 JSON 文件存在，不存在时写入默认数据 */
async function ensureFile(): Promise<void> {
  const info = await FileSystem.getInfoAsync(FILE_URI);
  if (!info.exists) {
    await FileSystem.writeAsStringAsync(FILE_URI, JSON.stringify(DEFAULT_PROJECTS, null, 2));
  }
}

/** 加载项目列表，JSON 损坏时自动用默认数据修复 */
export async function loadProjects(): Promise<Project[]> {
  await ensureFile();
  try {
    const json = await FileSystem.readAsStringAsync(FILE_URI);
    const data = JSON.parse(json);
    if (!Array.isArray(data)) throw new Error('数据格式错误');
    return data as Project[];
  } catch {
    // 数据损坏，重新初始化
    await FileSystem.writeAsStringAsync(
      FILE_URI,
      JSON.stringify(DEFAULT_PROJECTS, null, 2)
    );
    return [...DEFAULT_PROJECTS];
  }
}

/** 保存项目列表到文件 */
export async function saveProjects(projects: Project[]): Promise<void> {
  await FileSystem.writeAsStringAsync(FILE_URI, JSON.stringify(projects, null, 2));
}
