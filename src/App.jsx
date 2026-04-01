import React, { useMemo, useState } from 'react'
import {
  BarChart3,
  Building2,
  Download,
  FileSearch,
  Filter,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts'
import jsPDF from 'jspdf'

const GROUP_WEIGHTS = {
  A: 0.331,
  B: 0.318,
  C: 0.35,
}

const CRITERIA = [
  { code: 'A1', name: 'Tỷ lệ công việc đạt chuẩn ngay lần đầu', group: 'A', weight: 0.174 },
  { code: 'A2', name: 'Tỷ lệ nghiệm thu đạt yêu cầu', group: 'A', weight: 0.198 },
  { code: 'A3', name: 'Tỷ lệ lỗi cần sửa chữa', group: 'A', weight: 0.212 },
  { code: 'A4', name: 'Mức độ tuân thủ tiến độ thi công', group: 'A', weight: 0.199 },
  { code: 'A5', name: 'Mức độ phối hợp hiện trường', group: 'A', weight: 0.217 },

  { code: 'B1', name: 'Hồ sơ chất lượng đầy đủ và đúng mẫu', group: 'B', weight: 0.342 },
  { code: 'B2', name: 'Quy trình kiểm soát chất lượng nội bộ', group: 'B', weight: 0.333 },
  { code: 'B3', name: 'Khả năng khắc phục và phòng ngừa lỗi', group: 'B', weight: 0.325 },

  { code: 'C1', name: 'Kinh nghiệm thi công dự án tương tự', group: 'C', weight: 0.313 },
  { code: 'C2', name: 'Năng lực nhân sự chủ chốt', group: 'C', weight: 0.352 },
  { code: 'C3', name: 'Năng lực máy móc, thiết bị, tài chính', group: 'C', weight: 0.334 },
]

const SAMPLE_CONTRACTORS = [
  {
    id: 1,
    name: 'Công ty CP Xây dựng An Phát',
    specialty: 'Kết cấu bê tông cốt thép',
    region: 'TP.HCM',
    years: 12,
    licenses: 8,
    projects: 34,
    safetyRate: 96,
    responseTime: 2,
    aiRisk: 18,
    criteria: {
      A1: 86, A2: 88, A3: 82, A4: 85, A5: 84,
      B1: 80, B2: 78, B3: 82,
      C1: 88, C2: 86, C3: 84,
    },
  },
  {
    id: 2,
    name: 'Công ty TNHH MEP Minh Quân',
    specialty: 'MEP / Cơ điện',
    region: 'Bình Dương',
    years: 9,
    licenses: 6,
    projects: 27,
    safetyRate: 93,
    responseTime: 3,
    aiRisk: 24,
    criteria: {
      A1: 82, A2: 84, A3: 80, A4: 79, A5: 83,
      B1: 86, B2: 84, B3: 85,
      C1: 81, C2: 83, C3: 82,
    },
  },
  {
    id: 3,
    name: 'Công ty CP Hoàn thiện Đông Nam',
    specialty: 'Hoàn thiện nội ngoại thất',
    region: 'Đồng Nai',
    years: 7,
    licenses: 5,
    projects: 22,
    safetyRate: 91,
    responseTime: 4,
    aiRisk: 29,
    criteria: {
      A1: 78, A2: 80, A3: 76, A4: 77, A5: 79,
      B1: 82, B2: 80, B3: 81,
      C1: 76, C2: 79, C3: 78,
    },
  },
  {
    id: 4,
    name: 'Công ty CP Cơ điện Đại Nam',
    specialty: 'Hệ thống HVAC / PCCC',
    region: 'TP.HCM',
    years: 14,
    licenses: 10,
    projects: 41,
    safetyRate: 97,
    responseTime: 2,
    aiRisk: 14,
    criteria: {
      A1: 90, A2: 91, A3: 88, A4: 89, A5: 90,
      B1: 88, B2: 89, B3: 87,
      C1: 92, C2: 90, C3: 91,
    },
  },
]

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed']

function getGroupScore(criteriaMap, group) {
  const items = CRITERIA.filter((c) => c.group === group)
  return items.reduce((sum, item) => sum + (criteriaMap[item.code] || 0) * item.weight, 0)
}

function getTotalScore(criteriaMap) {
  const scoreA = getGroupScore(criteriaMap, 'A') * GROUP_WEIGHTS.A
  const scoreB = getGroupScore(criteriaMap, 'B') * GROUP_WEIGHTS.B
  const scoreC = getGroupScore(criteriaMap, 'C') * GROUP_WEIGHTS.C
  return scoreA + scoreB + scoreC
}

function getRating(score) {
  if (score >= 90) return 'Rất tốt'
  if (score >= 80) return 'Tốt'
  if (score >= 65) return 'Khá'
  if (score >= 50) return 'Trung bình'
  return 'Kém'
}

function getRecommendation(score, aiRisk) {
  if (score >= 85 && aiRisk <= 20) return 'Ưu tiên lựa chọn'
  if (score >= 75 && aiRisk <= 30) return 'Đạt yêu cầu'
  if (score >= 65) return 'Cần xem xét thêm'
  return 'Không khuyến nghị'
}

function formatScore(num) {
  return Number(num).toFixed(1)
}

export default function App() {
  const [contractors, setContractors] = useState(SAMPLE_CONTRACTORS)
  const [searchText, setSearchText] = useState('')
  const [selectedId, setSelectedId] = useState(4)

  const enrichedContractors = useMemo(() => {
    return contractors
      .map((contractor) => {
        const scoreA = getGroupScore(contractor.criteria, 'A')
        const scoreB = getGroupScore(contractor.criteria, 'B')
        const scoreC = getGroupScore(contractor.criteria, 'C')
        const total = getTotalScore(contractor.criteria)
        const rating = getRating(total)
        const recommendation = getRecommendation(total, contractor.aiRisk)

        return {
          ...contractor,
          scoreA,
          scoreB,
          scoreC,
          total,
          rating,
          recommendation,
        }
      })
      .sort((a, b) => b.total - a.total)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }))
  }, [contractors])

  const selectedContractor =
    enrichedContractors.find((item) => item.id === selectedId) || enrichedContractors[0]

  const filteredSuggestions = useMemo(() => {
    if (!searchText.trim()) return enrichedContractors
    const keyword = searchText.toLowerCase()
    return enrichedContractors.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.specialty.toLowerCase().includes(keyword) ||
        item.region.toLowerCase().includes(keyword)
    )
  }, [searchText, enrichedContractors])

  const radarData = selectedContractor
    ? [
        { subject: 'Nhóm A', value: Number(formatScore(selectedContractor.scoreA)) },
        { subject: 'Nhóm B', value: Number(formatScore(selectedContractor.scoreB)) },
        { subject: 'Nhóm C', value: Number(formatScore(selectedContractor.scoreC)) },
        { subject: 'An toàn', value: selectedContractor.safetyRate },
        { subject: 'Kinh nghiệm', value: Math.min(selectedContractor.years * 6, 100) },
      ]
    : []

  const compareData = enrichedContractors.map((item) => ({
    name: item.name.split(' ').slice(-2).join(' '),
    total: Number(formatScore(item.total)),
    aiRisk: item.aiRisk,
  }))

  const lineData = enrichedContractors.map((item) => ({
    name: item.name.split(' ').slice(-2).join(' '),
    A: Number(formatScore(item.scoreA)),
    B: Number(formatScore(item.scoreB)),
    C: Number(formatScore(item.scoreC)),
  }))

  const pieData = enrichedContractors.map((item) => ({
    name: item.name.split(' ').slice(-2).join(' '),
    value: Number(formatScore(item.total)),
  }))

  const kpi = {
    totalContractors: enrichedContractors.length,
    avgScore:
      enrichedContractors.reduce((sum, item) => sum + item.total, 0) /
      Math.max(enrichedContractors.length, 1),
    bestScore: enrichedContractors[0]?.total || 0,
    lowRiskCount: enrichedContractors.filter((item) => item.aiRisk <= 20).length,
  }

  const handleSelectContractor = (id) => {
    setSelectedId(id)
  }

  const handleCriteriaChange = (contractorId, code, value) => {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0))
    setContractors((prev) =>
      prev.map((item) =>
        item.id === contractorId
          ? {
              ...item,
              criteria: {
                ...item.criteria,
                [code]: safeValue,
              },
            }
          : item
      )
    )
  }

  const handleAiFetch = () => {
    if (!searchText.trim()) {
      alert('Vui lòng nhập từ khóa như: MEP, TP.HCM, hoàn thiện...')
      return
    }

    const keyword = searchText.toLowerCase()
    const matched = SAMPLE_CONTRACTORS.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.specialty.toLowerCase().includes(keyword) ||
        item.region.toLowerCase().includes(keyword)
    )

    if (matched.length === 0) {
      alert('AI chưa tìm thấy nhà thầu phù hợp trong dữ liệu mẫu.')
      return
    }

    setContractors(matched)
    setSelectedId(matched[0].id)
  }  const handleExportPdf = () => {
    const doc = new jsPDF()
    const top = enrichedContractors[0]

    doc.setFontSize(16)
    doc.text('BAO CAO DANH GIA NHA THAU PHU - XAY DUNG', 14, 18)

    doc.setFontSize(11)
    doc.text(`Tong so nha thau: ${kpi.totalContractors}`, 14, 30)
    doc.text(`Diem trung binh: ${formatScore(kpi.avgScore)}`, 14, 38)
    doc.text(`Nha thau dan dau: ${top?.name || 'N/A'}`, 14, 46)
    doc.text(`Tong diem dan dau: ${top ? formatScore(top.total) : '0.0'}`, 14, 54)

    let y = 70
    enrichedContractors.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.name} | Tong diem: ${formatScore(item.total)} | Xep loai: ${item.rating} | AI Risk: ${item.aiRisk}% | Khuyen nghi: ${item.recommendation}`,
        14,
        y
      )
      y += 10
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })

    doc.save('bao-cao-danh-gia-nha-thau.pdf')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Building2 size={22} />
          </div>
          <div>
            <h1>Builder Insight AI</h1>
            <p>Đánh giá năng lực doanh nghiệp xây dựng</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </button>
          <button className="nav-item">
            <FileSearch size={18} />
            <span>Đánh giá nhà thầu</span>
          </button>
          <button className="nav-item">
            <ShieldCheck size={18} />
            <span>Rủi ro & Tuân thủ</span>
          </button>
          <button className="nav-item">
            <Users size={18} />
            <span>Hồ sơ doanh nghiệp</span>
          </button>
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-title">
            <Sparkles size={18} />
            <span>AI Gợi ý</span>
          </div>
          <p>
            Nhập từ khóa như <strong>MEP</strong>, <strong>TP.HCM</strong>, <strong>hoàn thiện</strong> để
            lấy dữ liệu nhà thầu mẫu có sẵn.
          </p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>Hệ thống đánh giá & lựa chọn nhà thầu phụ</h2>
            <p>Tích hợp khung NCKH 11 tiêu chí + xếp hạng + biểu đồ + báo cáo PDF</p>
          </div>

          <div className="topbar-actions">
            <button className="ghost-btn">
              <Filter size={16} />
              Bộ lọc
            </button>
            <button className="primary-btn" onClick={handleExportPdf}>
              <Download size={16} />
              Xuất báo cáo PDF
            </button>
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-left">
            <span className="hero-badge">Smart Contractor Selection</span>
            <h3>Nền tảng hỗ trợ doanh nghiệp nhỏ trong lĩnh vực xây dựng</h3>
            <p>
              Ứng dụng đánh giá năng lực doanh nghiệp, chấm điểm nhà thầu phụ theo nghiên cứu khoa học,
              trực quan hóa dữ liệu bằng biểu đồ và đề xuất lựa chọn bằng AI.
            </p>

            <div className="search-box">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Nhập từ khóa: MEP, TP.HCM, hoàn thiện, tên nhà thầu..."
              />
              <button className="primary-btn" onClick={handleAiFetch}>
                <Sparkles size={16} />
                AI lấy dữ liệu nhà thầu
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="city-illustration">
              <div className="crane tower"></div>
              <div className="crane arm"></div>
              <div className="building b1"></div>
              <div className="building b2"></div>
              <div className="building b3"></div>
              <div className="sun"></div>
            </div>
          </div>
        </section>

        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon blue">
              <Building2 size={20} />
            </div>
            <div>
              <div className="kpi-value">{kpi.totalContractors}</div>
              <div className="kpi-label">Nhà thầu trong hệ thống</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon green">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="kpi-value">{formatScore(kpi.avgScore)}</div>
              <div className="kpi-label">Điểm trung bình</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon amber">
              <Star size={20} />
            </div>
            <div>
              <div className="kpi-value">{formatScore(kpi.bestScore)}</div>
              <div className="kpi-label">Điểm cao nhất</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon purple">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="kpi-value">{kpi.lowRiskCount}</div>
              <div className="kpi-label">Nhà thầu AI Risk thấp</div>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Top nhà thầu được đề xuất</h3>
              <span className="panel-sub">Xếp hạng theo tổng điểm NCKH</span>
            </div>

            <div className="ranking-table-wrapper">
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>Hạng</th>
                    <th>Tên nhà thầu</th>
                    <th>Chuyên môn</th>
                    <th>Khu vực</th>
                    <th>Năm KN</th>
                    <th>GP</th>
                    <th>Nhóm A</th>
                    <th>Nhóm B</th>
                    <th>Nhóm C</th>
                    <th>Tổng</th>
                    <th>AI Risk</th>
                    <th>Khuyến nghị</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedContractors.map((item) => (
                    <tr
                      key={item.id}
                      className={selectedId === item.id ? 'selected-row' : ''}
                      onClick={() => handleSelectContractor(item.id)}
                    >
                      <td>#{item.rank}</td>
                      <td>{item.name}</td>
                      <td>{item.specialty}</td>
                      <td>{item.region}</td>
                      <td>{item.years}</td>
                      <td>{item.licenses}</td>
                      <td>{formatScore(item.scoreA)}</td>
                      <td>{formatScore(item.scoreB)}</td>
                      <td>{formatScore(item.scoreC)}</td>
                      <td className="strong">{formatScore(item.total)}</td>
                      <td>
                        <span className={`risk-badge ${item.aiRisk <= 20 ? 'low' : item.aiRisk <= 30 ? 'mid' : 'high'}`}>
                          {item.aiRisk}%
                        </span>
                      </td>
                      <td>
                        <span className="recommend-badge">{item.recommendation}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Hồ sơ nhà thầu đang chọn</h3>
              <span className="panel-sub">Chi tiết năng lực & khuyến nghị</span>
            </div>

            {selectedContractor && (
              <div className="contractor-profile">
                <div className="profile-title">
                  <h4>{selectedContractor.name}</h4>
                  <span className="recommend-badge">{selectedContractor.recommendation}</span>
                </div>

                <div className="profile-grid">
                  <div className="mini-stat">
                    <span>Chuyên môn</span>
                    <strong>{selectedContractor.specialty}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Khu vực</span>
                    <strong>{selectedContractor.region}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Số dự án</span>
                    <strong>{selectedContractor.projects}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>An toàn lao động</span>
                    <strong>{selectedContractor.safetyRate}%</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Thời gian phản hồi</span>
                    <strong>{selectedContractor.responseTime} ngày</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Xếp loại</span>
                    <strong>{selectedContractor.rating}</strong>
                  </div>
                </div>

                <div className="score-summary">
                  <div className="score-pill">A: {formatScore(selectedContractor.scoreA)}</div>
                  <div className="score-pill">B: {formatScore(selectedContractor.scoreB)}</div>
                  <div className="score-pill">C: {formatScore(selectedContractor.scoreC)}</div>
                  <div className="score-pill total">Tổng: {formatScore(selectedContractor.total)}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="chart-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Radar đánh giá nhà thầu đang chọn</h3>
              <span className="panel-sub">Năng lực tổng hợp theo nhóm chỉ tiêu</span>
            </div>

            <div className="chart-box">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>So sánh tổng điểm & AI Risk</h3>
              <span className="panel-sub">Phục vụ quyết định lựa chọn nhà thầu</span>
            </div>

            <div className="chart-box">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={compareData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Tổng điểm" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="aiRisk" name="AI Risk" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>        <section className="chart-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Xu hướng hiệu quả dự án</h3>
              <span className="panel-sub">Mô phỏng hiệu suất qua các giai đoạn gần đây</span>
            </div>

            <div className="chart-box">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completion"
                    name="Hoàn thành đúng tiến độ"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="quality"
                    name="Điểm chất lượng"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Cơ cấu mức độ khuyến nghị</h3>
              <span className="panel-sub">Phân loại nhà thầu theo đề xuất hệ thống</span>
            </div>

            <div className="chart-box">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={recommendationData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {recommendationData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#2563eb', '#10b981', '#f59e0b', '#ef4444'][index % 4]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Bảng chấm điểm chi tiết theo 11 tiêu chí NCKH</h3>
            <span className="panel-sub">Khung đánh giá tích hợp trực tiếp vào ứng dụng</span>
          </div>

          <div className="criteria-table-wrapper">
            <table className="criteria-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tiêu chí</th>
                  <th>Nhóm</th>
                  <th>Trọng số</th>
                  <th>Điểm hiện tại</th>
                  <th>Mô tả đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {criteriaFramework.map((criteria) => (
                  <tr key={criteria.id}>
                    <td>{criteria.id}</td>
                    <td>{criteria.name}</td>
                    <td>{criteria.group}</td>
                    <td>{criteria.weight}%</td>
                    <td>{selectedContractor ? formatScore(selectedContractor.criteriaScores[criteria.id]) : '0.0'}</td>
                    <td>{criteria.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="footer-panel">
          <div className="footer-card">
            <h3>Giải pháp dành cho doanh nghiệp nhỏ xây dựng</h3>
            <ul>
              <li>Chuẩn hóa quy trình đánh giá nhà thầu phụ theo tiêu chí nghiên cứu khoa học.</li>
              <li>Tăng tốc ra quyết định nhờ xếp hạng tự động, AI Risk và khuyến nghị lựa chọn.</li>
              <li>Tích hợp dashboard trực quan: KPI, bảng xếp hạng, radar, cột, đường, tròn.</li>
              <li>Xuất báo cáo PDF nhanh để phục vụ họp nội bộ, thẩm định và lưu hồ sơ.</li>
              <li>Có thể mở rộng kết nối API, dữ liệu web scraping hoặc AI search nhà thầu thực tế.</li>
            </ul>
          </div>

          <div className="footer-card highlight">
            <h3>Hướng mở rộng AI thực tế</h3>
            <p>
              Bản demo hiện dùng dữ liệu mẫu thông minh. Khi triển khai thật, có thể tích hợp:
            </p>
            <ul>
              <li>API danh bạ doanh nghiệp xây dựng / dữ liệu đấu thầu.</li>
              <li>AI crawl hồ sơ năng lực từ website, LinkedIn, hồ sơ công ty, cổng đấu thầu.</li>
              <li>OCR đọc hồ sơ PDF, giấy phép, báo cáo tài chính, chứng chỉ ISO.</li>
              <li>Mô hình AI chấm rủi ro theo lịch sử tiến độ, an toàn và tranh chấp.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
