/**
 * 使用 GitHub API 创建或更新单个文件并提交
 *
 * @param {Object} params
 * @param {string} params.msg - 提交信息
 * @param {string} params.filename - 文件路径 (例如: 'docs/hello.md')
 * @param {string} params.content - 文件内容 (字符串)
 * @param {string} params.branch - 分支名 (例如: 'main')
 * @param {string} params.repo - 仓库路径 (格式: 'owner/repo')
 * @param {string} params.token - GitHub Personal Access Token
 */
export async function createSingleFileCommit({ msg, filename, content, branch, repo, token }) {
  const baseUrl = `https://api.github.com/repos/${repo}/contents/${filename}`;

  // 1. 尝试获取现有文件的 SHA (如果文件已存在，更新操作必须传 SHA)
  let sha = null;
  try {
    const getRes = await fetch(`${baseUrl}?ref=${branch}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Node-Fetch-App' // GitHub 必须要求 User-Agent
      }
    });

    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }
  } catch (err) {
    // 如果文件不存在，GitHub 会返回 404，这里捕获异常继续即可
    console.log('File does not exist, creating new file...');
  }

  // 2. 准备提交的数据
  // GitHub API 要求内容必须是 Base64 编码
  const body = {
    message: msg,
    content: Buffer.from(content).toString('base64'),
    branch: branch
  };

  if (sha) {
    // @ts-ignore
    body.sha = sha; // 如果是更新文件，必须带上旧的 SHA
  }

  // 3. 执行 PUT 请求提交文件
  const response = await fetch(baseUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Node-Fetch-App'
    },
    body: JSON.stringify(body)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`GitHub API Error: ${result.message || response.statusText}`);
  }

  return result;
}

// --- 使用示例 ---
/*
createSingleFileCommit({
    msg: 'feat: update config file',
    filename: 'config.json',
    content: JSON.stringify({ version: "1.0.0" }, null, 2),
    branch: 'main',
    repo: 'your-username/your-repo-name',
    token: 'ghp_your_personal_access_token'
})
.then(res => console.log('Commit Success:', res.commit.sha))
.catch(err => console.error('Commit Failed:', err));
*/