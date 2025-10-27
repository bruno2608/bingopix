const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const BINGOS_FILE = path.join(DATA_DIR, 'bingos.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function ensureFileExists(filePath, defaultData = {}) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFileExists(BINGOS_FILE, {});
ensureFileExists(HISTORY_FILE, { games: [] });
ensureFileExists(SETTINGS_FILE, {});

function readData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler ${filePath}:`, error);
    return filePath === HISTORY_FILE ? { games: [] } : {};
  }
}

function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erro ao escrever ${filePath}:`, error);
    return false;
  }
}

function getBingos() {
  return readData(BINGOS_FILE);
}

function saveBingos(bingos) {
  return writeData(BINGOS_FILE, bingos);
}

function getHistory() {
  return readData(HISTORY_FILE);
}

function saveHistory(history) {
  return writeData(HISTORY_FILE, history);
}

function getSettings(guildId) {
  const allSettings = readData(SETTINGS_FILE);
  return allSettings[guildId] || {
    adminRoles: [],
    drawChannel: null
  };
}

function saveSettings(guildId, settings) {
  const allSettings = readData(SETTINGS_FILE);
  allSettings[guildId] = settings;
  return writeData(SETTINGS_FILE, allSettings);
}

module.exports = {
  getBingos,
  saveBingos,
  getHistory,
  saveHistory,
  getSettings,
  saveSettings
};
