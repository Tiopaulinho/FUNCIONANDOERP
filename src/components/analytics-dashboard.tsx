
"use client"

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, CreditCard, DollarSign, Package, TrendingDown, Users } from 'lucide-react';
import type { Customer, Lead, OrderStatus, Product, SalesOrder } from '@/lib/schemas';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';

interface AnalyticsDashboardProps {
  orders: SalesOrder[];
  products: (Product & { id: string })[];
  customers: (Customer & { id: string })[];
  leads: Lead[];
}

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export default function AnalyticsDashboard({ orders, products, customers, leads }: AnalyticsDashboardProps) {

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const {
    totalRevenue,
    totalProfit,
    accountsReceivable
  } = React.useMemo(() => {
    let revenue = 0;
    let profit = 0;
    let receivable = 0;

    orders.forEach(order => {
        if (order.status === 'Entregue' && order.paymentStatus === 'Pago') {
            revenue += order.total;
            
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const rawMaterialCost = product.rawMaterialCost || 0;
                    const laborCost = product.laborCost || 0;
                    const suppliesCost = product.suppliesCost || 0;
                    const feesPercent = product.fees || 0;
                    const taxesPercent = product.taxes || 0;
                    
                    const baseCost = rawMaterialCost + laborCost + suppliesCost;
                    const feesValue = item.price * (feesPercent / 100);
                    const taxesValue = item.price * (taxesPercent / 100);
                    const totalCost = baseCost + feesValue + taxesValue;
                    
                    profit += (item.price - totalCost) * item.quantity;
                }
            });
        }
        if (order.status === 'Entregue' && order.paymentStatus !== 'Pago') {
            receivable += order.total;
        }
    });

    return { totalRevenue: revenue, totalProfit: profit, accountsReceivable: receivable };
  }, [orders, products]);
  
  const salesByStatusChartData = React.useMemo(() => {
    const statusData: { [key in OrderStatus]?: number } = {
      Pendente: 0,
      Processando: 0,
      Enviado: 0,
      Entregue: 0,
    };

    orders.forEach(order => {
      if (statusData[order.status!] !== undefined) {
        statusData[order.status!]! += order.total;
      }
    });
    
    return Object.entries(statusData)
      .map(([status, value]) => ({
        status: status as OrderStatus,
        value,
        fill: `var(--chart-${Object.keys(statusData).indexOf(status) + 1})`,
      }))
      .filter(item => item.value > 0);

  }, [orders]);


  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Faturamento Total"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          description="Receita de pedidos entregues e pagos"
        />
        <StatCard
          title="Lucro Líquido"
          value={formatCurrency(totalProfit)}
          icon={TrendingDown}
          description="Lucro de pedidos entregues e pagos"
        />
        <StatCard
          title="Contas a Receber"
          value={formatCurrency(accountsReceivable)}
          icon={CreditCard}
          description="Pedidos entregues com pagamento pendente"
        />
        <StatCard
          title="Total de Clientes"
          value={customers.length.toString()}
          icon={Users}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Vendas por Status</CardTitle>
                <CardDescription>Distribuição do valor total dos pedidos por status.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                 <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                        <Pie data={salesByStatusChartData} dataKey="value" nameKey="status" innerRadius={60}>
                            {salesByStatusChartData.map((entry) => (
                                <Cell key={entry.status} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
