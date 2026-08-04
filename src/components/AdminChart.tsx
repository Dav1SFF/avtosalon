"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface AdminChartProps {
  data: {
    name: string;
    count: number;
  }[];
}

export default function AdminChart({ data }: AdminChartProps) {
  return (
    <div className="w-full h-80 bg-[#0E2A24] p-6 rounded-[24px] border border-white/5 shadow-lg">
      <h3 className="text-white font-bold text-base mb-6 uppercase tracking-wider">Заявки за категоріями</h3>
      
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" stroke="#A8B0AF" fontSize={11} tickLine={false} />
          <YAxis stroke="#A8B0AF" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#071E1A",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              color: "#F5F5F5",
            }}
          />
          <Bar dataKey="count" fill="#FFD400" radius={[6, 6, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
