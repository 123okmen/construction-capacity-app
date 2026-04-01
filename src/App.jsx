import React, { useMemo, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import {
  Building2,
  ClipboardCheck,
  FileText,
  Download,
  Trophy,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

const enterpriseCriteria = [
  { key: "governance", label: "Quản trị điều hành" },
  { key: "finance", label: "Tài chính" },
  { key: "technical", label: "Kỹ thuật thi công" },
  { key: "digital", label: "Công nghệ số" },
  { key: "hrSafety", label: "Nhân sự & an toàn" }
];

const contractorCriteria = [
  { key: "A1", label: "A1. Kinh nghiệm công trình tương tự" },
  { key: "A2", label: "A2. Năng lực nhân sự chủ chốt" },
  { key: "A3", label: "A3. Thiết bị & máy móc thi công" },
  { key: "A4", label: "A4. Biện pháp thi công & tiến độ" },
  { key: "A5", label: "A5. Hệ thống an toàn & chất lượng" },
  { key: "B1", label: "B1. Năng lực tài chính" },
  { key: "B2", label: "B2. Giá chào thầu" },
  { key: "B3", label: "B3. Điều kiện thanh toán & bảo lãnh" },
  { key: "C1", label: "C1. Hồ sơ pháp lý & tuân thủ" },
  { key: "C2", label: "C2. Uy tín & lịch sử thực hiện" },
  { key: "C3", label: "C3. Khả năng phối hợp & phản hồi" }
];

const defaultEnterprise = {
  governance: 72,
  finance: 68,
  technical: 80,
  digital: 55,
  hrSafety: 77
};

const defaultContractors = [
  {
    name: "Nhà thầu phụ A",
    scores: { A1: 85, A2: 78, A3: 80, A4: 82, A5: 88, B1: 72, B2: 76, B3: 70, C1: 90, C2: 84, C3: 82 }
  },
  {
    name: "Nhà thầu phụ B",
    scores: { A1: 76, A2: 82, A3: 74, A4: 79, A5: 80, B1: 85, B2: 88, B3: 84, C1: 86, C2: 80, C3: 78 }
  },
  {
    name: "Nhà thầu phụ C",
    scores: { A1: 90, A2: 86, A3: 88, A4: 87, A5: 92, B1: 70, B2: 68, B3: 72, C1: 91, C2: 89, C3: 88 }
  }
];

function clamp(val) {
  const n = Number(val);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function getEnterpriseLevel(score) {
  if (score >= 85) return { label: "Xuất sắc", color: "green" };
  if (score >= 70) return { label: "Khá", color: "blue" };
  if (score >= 50) return { label: "Trung bình", color: "orange" };
  return { label: "Cần cải thiện", color: "red" };
}

function getContractorDecision(score) {
  if (score >= 85) return "Ưu tiên lựa chọn";
  if (score >= 75) return "Đạt yêu cầu";
  if (score >= 60) return "Cân nhắc thêm";
  return "Không khuyến nghị";
}

function groupScores(scores) {
  const groupA = (scores.A1 + scores.A2 + scores.A3 + scores.A4 + scores.A5) / 5;
  const groupB = (scores.B1 + scores.B2 + scores.B3) / 3;
  const groupC = (scores.C1 + scores.C2 + scores.C3) / 3;
  const total = groupA * 0.5 + groupB * 0.3 + groupC * 0.2;
  return { groupA, groupB, groupC, total };
}

export default function App() {
  const [tab, setTab] = useState("enterprise");
  const [enterprise, setEnterprise] = useState(defaultEnterprise);
  const [contractors, setContractors] = useState(defaultContractors);

  const enterpriseResult = useMemo(() => {
    const values = Object.values(enterprise);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const minKey = Object.keys(enterprise).reduce((min, key) =>
      enterprise[key] < enterprise[min] ? key : min
    );
    const weakest = enterpriseCriteria.find((c) => c.key === minKey)?.label || "";
    return {
      cci: avg,
      level: getEnterpriseLevel(avg),
      weakest
    };
  }, [enterprise]);

  const rankedContractors = useMemo(() => {
    return contractors
      .map((c) => {
        const grouped = groupScores(c.scores);
        return { ...c, ...grouped, decision: getContractorDecision(grouped.total) };
      })
      .sort((a, b) => b.total - a.total);
  }, [contractors]);

  const topContractor = rankedContractors[0];

  const radarData = enterpriseCriteria.map((item) => ({
    subject: item.label,
    value: enterprise[item.key]
  }));

  const barData = rankedContractors.map((c) => ({
    name: c.name,
    "Nhóm A": Number(c.groupA.toFixed(1)),
    "Nhóm B": Number(c.groupB.toFixed(1)),
    "Nhóm C": Number(c.groupC.toFixed(1)),
    "Tổng điểm": Number(c.total.toFixed(1))
  }));

  const handleEnterpriseChange = (key, value) => {
    setEnterprise((prev) => ({ ...prev, [key]: clamp(value) }));
  };

  const handleContractorChange = (index, key, value) => {
    setContractors((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        scores: {
          ...next[index].scores,
          [key]: clamp(value)
        }
      };
      return next;
    });
  };

  const exportPdf = () => {
    window.print();
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <h1>Ứng dụng đánh giá năng lực & lựa chọn nhà thầu phụ</h1>
          <p>
            Dành cho doanh nghiệp nhỏ trong lĩnh vực xây dựng – tích hợp khung đánh giá năng lực nội bộ
            và bộ tiêu chí hỗ trợ lựa chọn nhà thầu phụ theo định hướng NCKH.
          </p>
        </div>
        <button className="print-btn" onClick={exportPdf}>
          <Download size={18} />
          Xuất báo cáo PDF
        </button>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <div className="icon blue"><Building2 size={18} /></div>
          <div>
            <span>Chỉ số năng lực tổng hợp (CCI)</span>
            <strong>{enterpriseResult.cci.toFixed(1)}</strong>
          </div>
        </div>
        <div className="summary-card">
          <div className="icon gold"><Trophy size={18} /></div>
          <div>
            <span>Nhà thầu phụ xếp hạng #1</span>
            <strong>{topContractor?.name || "-"}</strong>
          </div>
        </div>
        <div className="summary-card">
          <div className="icon green"><CheckCircle2 size={18} /></div>
          <div>
            <span>Mức đánh giá doanh nghiệp</span>
            <strong>{enterpriseResult.level.label}</strong>
          </div>
        </div>
        <div className="summary-card">
          <div className="icon orange"><AlertTriangle size={18} /></div>
          <div>
            <span>Điểm yếu cần ưu tiên</span>
            <strong>{enterpriseResult.weakest}</strong>
          </div>
        </div>
      </section>

      <nav className="tabs">
        <button className={tab === "enterprise" ? "active" : ""} onClick={() => setTab("enterprise")}>
          <Building2 size={16} /> Đánh giá doanh nghiệp
        </button>
        <button className={tab === "contractor" ? "active" : ""} onClick={() => setTab("contractor")}>
          <ClipboardCheck size={16} /> Chọn nhà thầu phụ
        </button>
        <button className={tab === "report" ? "active" : ""} onClick={() => setTab("report")}>
          <FileText size={16} /> Báo cáo tổng hợp
        </button>
      </nav>

      {tab === "enterprise" && (
        <section className="panel-grid">
          <div className="card">
            <h2>1. Đánh giá năng lực doanh nghiệp xây dựng</h2>
            <p className="muted">Nhập điểm từng nhóm tiêu chí (0–100).</p>
            <div className="form-grid">
              {enterpriseCriteria.map((item) => (
                <label key={item.key} className="field">
                  <span>{item.label}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={enterprise[item.key]}
                    onChange={(e) => handleEnterpriseChange(item.key, e.target.value)}
                  />
                </label>
              ))}
            </div>

            <div className="result-box">
              <div><strong>CCI:</strong> {enterpriseResult.cci.toFixed(1)}</div>
              <div><strong>Xếp loại:</strong> {enterpriseResult.level.label}</div>
              <div><strong>Nhóm yếu nhất:</strong> {enterpriseResult.weakest}</div>
              <div>
                <strong>Khuyến nghị:</strong>{" "}
                {enterpriseResult.weakest === "Công nghệ số"
                  ? "Ưu tiên đầu tư số hóa hồ sơ, theo dõi tiến độ và quản lý dữ liệu thi công."
                  : enterpriseResult.weakest === "Tài chính"
                  ? "Củng cố dòng tiền, kiểm soát công nợ và tăng minh bạch tài chính."
                  : enterpriseResult.weakest === "Quản trị điều hành"
                  ? "Chuẩn hóa quy trình điều hành, phân quyền và KPI nội bộ."
                  : enterpriseResult.weakest === "Kỹ thuật thi công"
                  ? "Nâng cấp năng lực tổ chức thi công, thiết bị và kiểm soát chất lượng."
                  : "Tăng cường đào tạo, an toàn lao động và phát triển nhân sự chủ chốt."}
              </div>
            </div>
          </div>

          <div className="card chart-card">
            <h2>Biểu đồ radar năng lực</h2>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={360}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar dataKey="value" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {tab === "contractor" && (
        <section className="stack">
          <div className="card">
            <h2>2. Khung đánh giá lựa chọn nhà thầu phụ</h2>
            <p className="muted">
              Bộ tiêu chí chia 3 nhóm: A (Kỹ thuật – năng lực thực hiện), B (Tài chính – thương mại),
              C (Pháp lý – phối hợp). Điểm tổng hợp = A×50% + B×30% + C×20%.
            </p>
          </div>

          {contractors.map((contractor, idx) => (
            <div className="card" key={contractor.name}>
              <h3>{contractor.name}</h3>
              <div className="contractor-grid">
                {contractorCriteria.map((item) => (
                  <label key={item.key} className="field small">
                    <span>{item.label}</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={contractor.scores[item.key]}
                      onChange={(e) => handleContractorChange(idx, item.key, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="panel-grid">
            <div className="card">
              <h2>Bảng xếp hạng nhà thầu phụ</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Hạng</th>
                      <th>Nhà thầu</th>
                      <th>Nhóm A</th>
                      <th>Nhóm B</th>
                      <th>Nhóm C</th>
                      <th>Tổng điểm</th>
                      <th>Kết luận</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedContractors.map((c, index) => (
                      <tr key={c.name}>
                        <td>#{index + 1}</td>
                        <td>{c.name}</td>
                        <td>{c.groupA.toFixed(1)}</td>
                        <td>{c.groupB.toFixed(1)}</td>
                        <td>{c.groupC.toFixed(1)}</td>
                        <td><strong>{c.total.toFixed(1)}</strong></td>
                        <td>{c.decision}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card chart-card">
              <h2>Biểu đồ so sánh nhà thầu</h2>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Nhóm A" />
                    <Bar dataKey="Nhóm B" />
                    <Bar dataKey="Nhóm C" />
                    <Bar dataKey="Tổng điểm" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "report" && (
        <section className="panel-grid">
          <div className="card">
            <h2>3. Báo cáo tổng hợp cho doanh nghiệp</h2>
            <div className="report-block">
              <h3>Kết quả đánh giá năng lực doanh nghiệp</h3>
              <ul>
                <li>CCI tổng hợp: <strong>{enterpriseResult.cci.toFixed(1)}</strong></li>
                <li>Xếp loại hiện tại: <strong>{enterpriseResult.level.label}</strong></li>
                <li>Nhóm cần ưu tiên cải thiện: <strong>{enterpriseResult.weakest}</strong></li>
              </ul>

              <h3>Kết quả lựa chọn nhà thầu phụ</h3>
              <ul>
                <li>Nhà thầu xếp hạng cao nhất: <strong>{topContractor?.name}</strong></li>
                <li>Tổng điểm: <strong>{topContractor?.total.toFixed(1)}</strong></li>
                <li>Kết luận: <strong>{topContractor?.decision}</strong></li>
              </ul>

              <h3>Khuyến nghị quản trị</h3>
              <ol>
                <li>Ưu tiên chọn nhà thầu có điểm Nhóm A cao để đảm bảo năng lực thực thi thực tế.</li>
                <li>Không chỉ dựa vào giá thấp, cần cân bằng giữa kỹ thuật – tài chính – pháp lý.</li>
                <li>Sử dụng app định kỳ theo quý để cập nhật năng lực doanh nghiệp và danh sách đối tác.</li>
                <li>Tích hợp kết quả này vào quy trình ra quyết định nội bộ và hồ sơ NCKH/demo.</li>
              </ol>
            </div>
          </div>

          <div className="card">
            <h2>Hướng dẫn xuất PDF</h2>
            <p className="muted">
              Nhấn nút <strong>“Xuất báo cáo PDF”</strong> ở góc trên phải → cửa sổ in mở ra →
              chọn <strong>Save as PDF</strong> để lưu báo cáo.
            </p>
            <div className="note">
              Mẹo: Trước khi lưu PDF, chuyển sang tab <strong>Báo cáo tổng hợp</strong> để nội dung xuất ra đẹp nhất.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
