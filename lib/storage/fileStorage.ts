import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// 데이터 디렉토리 초기화
export async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// 파일 존재 확인
export async function fileExists(filename: string): Promise<boolean> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// JSON 파일 읽기
export async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data);
}

// JSON 파일 쓰기 (원자적 쓰기)
export async function writeJsonFile<T>(
  filename: string,
  data: T
): Promise<void> {
  await ensureDataDirectory();

  const filePath = path.join(DATA_DIR, filename);
  const tempPath = `${filePath}.tmp`;

  // 임시 파일에 쓰기
  const jsonString = JSON.stringify(data, null, 2);
  await fs.writeFile(tempPath, jsonString, "utf-8");

  // 원자적으로 이름 변경 (데이터 손실 방지)
  await fs.rename(tempPath, filePath);
}

// 동시 쓰기 방지를 위한 간단한 잠금
const writeLocks = new Map<string, Promise<void>>();

export async function writeJsonFileWithLock<T>(
  filename: string,
  data: T
): Promise<void> {
  // 이전 쓰기 작업이 완료될 때까지 대기
  const existingLock = writeLocks.get(filename);
  if (existingLock) {
    await existingLock;
  }

  // 새 쓰기 작업 시작
  const writePromise = writeJsonFile(filename, data);
  writeLocks.set(filename, writePromise);

  try {
    await writePromise;
  } finally {
    writeLocks.delete(filename);
  }
}
