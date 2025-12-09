import styled from 'styled-components';
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  downloadDashboardPDF,
  getAnnualBilling,
  getDashboardMonthly,
  getServiceOrdersNearDeadline,
  getServiceOrdersPastDeadline
} from '../../services/DashboardService';

const Block = styled.section`
  padding: 16px 20px;
`;

const RowHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const HeadLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DownloadButton = styled.button`
  padding: 8px 14px;
  background: #1864ab;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s;

  &:hover {
    background: #0d3c6e;
  }
`;

const MonthSelect = styled.select`
  padding: 8px 10px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  background: #fff;
  color: #000;
`;

const Cards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const Card = styled.div`
  flex: 1 1 240px;
  min-width: 220px;
  border-radius: 14px;
  padding: 16px 18px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.span`
  font-size: 14px;
  opacity: 0.9;
`;

const Value = styled.strong`
  font-size: 24px;
  letter-spacing: 0.3px;
`;

const ChartWrapper = styled.div`
  margin-top: 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
`;

const ChartContainer = styled.div`
  flex: 1 1 50%;
  height: 280px;
`;

const OrdersContainer = styled.div`
  flex: 1 1 40%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OrderCard = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  padding: 14px 16px;
`;

const OrderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 15px;
  color: ${(props) => props.color || '#000'};
  margin-bottom: 8px;
`;

const OrderItem = styled.div`
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;

  span {
    color: #888;
    font-weight: 500;
  }
`;

const ScrollableList = styled.div`
  max-height: 140px;
  overflow-y: auto;
  margin-top: 8px;

  scrollbar-width: thin;
  scrollbar-color: #aaa transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #aaa;
    border-radius: 3px;
  }
`;

const cardBg = {
  faturado: 'linear-gradient(135deg, #5ecf68, #9ad84d)',
  servicos: 'linear-gradient(135deg, #0aa1dd, #1864ab)',
  pecas: 'linear-gradient(135deg, #ffd452, #f0b429)',
  custos: 'linear-gradient(135deg, #ff6b6b, #f06543)',
  osEmitidas: 'linear-gradient(135deg, #003b73, #007bff)',
  novosClientes: 'linear-gradient(135deg, #004d40, #26a69a)',
};

const months = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

function formatBRL(n) {
  return n?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0,00";
}

function FinanceSummary() {
  const currentDate = new Date();
  const [monthIndex, setMonthIndex] = useState(currentDate.getMonth());
  const [monthlyData, setMonthlyData] = useState(null);
  const [annualData, setAnnualData] = useState([]);
  const [ordersNear, setOrdersNear] = useState([]);
  const [ordersLate, setOrdersLate] = useState([]);
  const [loading, setLoading] = useState(false);

  const monthName = months[monthIndex];
  const currentYear = currentDate.getFullYear();

  const handleDownloadReport = async () => {
  try {
    const monthParam = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}`;

    const pdfArrayBuffer = await downloadDashboardPDF(monthParam);

    const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-dashboard-${monthParam}.pdf`;
    link.click();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Erro ao baixar relatório:", err);
  }
};


  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const monthParam = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}`;

        const [monthlyRes, annualRes, nearRes, pastRes] = await Promise.all([
          getDashboardMonthly(monthParam),
          getAnnualBilling(currentYear),
          getServiceOrdersNearDeadline(),
          getServiceOrdersPastDeadline(),
        ]);

        setMonthlyData(monthlyRes);
        setAnnualData(annualRes);
        setOrdersNear(nearRes);
        setOrdersLate(pastRes);

      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [monthIndex]);

  const mdata = useMemo(() => {
    if (!monthlyData) {
      return { faturado: 0, servicos: 0, pecas: 0, custos: 0, osEmitidas: 0, novosClientes: 0 };
    }

    const { billingTotalValue, totalCost, quantityNewClients } = monthlyData;
    return {
      faturado: billingTotalValue?.totalGeneral ?? 0,
      servicos: billingTotalValue?.totalServices ?? 0,
      pecas: billingTotalValue?.totalProducts ?? 0,
      custos: totalCost ?? 0,
      osEmitidas: billingTotalValue?.countOrders ?? 0,
      novosClientes: quantityNewClients ?? 0,
    };
  }, [monthlyData]);

  const chartData = useMemo(() => {
    return (annualData || []).map((item) => ({
      month: months[item.month - 1]?.substring(0, 3) ?? "Mês",
      faturado: item.totalBilling,
    }));
  }, [annualData]);

  if (loading) return <p>Carregando...</p>;

  return (
    <Block>
      <RowHead>
        <HeadLeft>
          <MonthSelect
            value={monthName}
            onChange={(e) => setMonthIndex(months.indexOf(e.target.value))}
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </MonthSelect>
        </HeadLeft>

        <DownloadButton onClick={handleDownloadReport}>
          📄 Baixar relatório
        </DownloadButton>
      </RowHead>

      <Cards>
        <Card style={{ background: cardBg.faturado }}>
          <Label>Faturado no mês</Label>
          <Value>{formatBRL(mdata.faturado)}</Value>
        </Card>

        <Card style={{ background: cardBg.servicos }}>
          <Label>Serviços</Label>
          <Value>{formatBRL(mdata.servicos)}</Value>
        </Card>

        <Card style={{ background: cardBg.pecas }}>
          <Label>Peças</Label>
          <Value>{formatBRL(mdata.pecas)}</Value>
        </Card>

        <Card style={{ background: cardBg.custos }}>
          <Label>Custo do mês</Label>
          <Value>{formatBRL(mdata.custos)}</Value>
        </Card>
      </Cards>

      <Cards style={{ marginTop: "18px" }}>
        <Card style={{ background: cardBg.osEmitidas }}>
          <Label>O.S Emitidas</Label>
          <Value>{mdata.osEmitidas}</Value>
        </Card>

        <Card style={{ background: cardBg.novosClientes }}>
          <Label>Novos Clientes</Label>
          <Value>{mdata.novosClientes}</Value>
        </Card>
      </Cards>

      <ChartWrapper>
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatBRL(v)} />
              <Bar dataKey="faturado" fill="#5ecf68" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <OrdersContainer>
          <OrderCard>
            <OrderTitle color="#1864ab">📅 Próximas do vencimento</OrderTitle>
            <ScrollableList>
              {ordersNear.length > 0 ? (
                ordersNear.map((o) => (
                  <OrderItem key={o._id}>
                    <span>{o.code}</span> | {o.client} | {o.vehicle} |{" "}
                    {new Date(o.deadline).toLocaleDateString("pt-BR")}
                  </OrderItem>
                ))
              ) : (
                <p>Nenhuma ordem próxima do vencimento.</p>
              )}
            </ScrollableList>
          </OrderCard>

          <OrderCard>
            <OrderTitle color="#c92a2a">⛔ Vencidas</OrderTitle>
            <ScrollableList>
              {ordersLate.length > 0 ? (
                ordersLate.map((o) => (
                  <OrderItem key={o._id}>
                    <span>{o.code}</span> | {o.client} |{" "}
                    {new Date(o.deadline).toLocaleDateString("pt-BR")}
                  </OrderItem>
                ))
              ) : (
                <p>Nenhuma ordem vencida.</p>
              )}
            </ScrollableList>
          </OrderCard>
        </OrdersContainer>

      </ChartWrapper>
    </Block>
  );
}

export default FinanceSummary;
