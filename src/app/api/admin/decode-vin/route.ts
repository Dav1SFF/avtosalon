import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vin = searchParams.get("vin");

  if (!vin || vin.length !== 17) {
    return NextResponse.json({ error: "Invalid VIN. Must be 17 characters." }, { status: 400 });
  }

  try {
    // We use the free US Gov NHTSA API (no API key required)
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`);
    const data = await response.json();

    if (data && data.Results && data.Results.length > 0) {
      const result = data.Results[0];
      
      // Extract what we need
      const make = result.Make;
      const model = result.Model;
      const year = parseInt(result.ModelYear) || null;
      let body = "Седан";
      if (result.BodyClass) {
        const b = result.BodyClass.toLowerCase();
        if (b.includes("sport utility") || b.includes("suv") || b.includes("mpv") || b.includes("crossover")) body = "Кросовер";
        else if (b.includes("sedan")) body = "Седан";
        else if (b.includes("coupe")) body = "Купе";
        else if (b.includes("hatchback")) body = "Хетчбек";
        else if (b.includes("wagon")) body = "Універсал";
        else if (b.includes("truck") || b.includes("pickup")) body = "Пікап";
      }

      const engine = result.DisplacementL ? `${parseFloat(result.DisplacementL).toFixed(1)} ${result.FuelTypePrimary === "Diesel" ? "дизель" : "бензин"}` : "";
      
      const engineVol = result.DisplacementCC ? `${parseFloat(result.DisplacementCC).toFixed(0)} см³` : "";
      const power = result.EngineHP ? `${parseFloat(result.EngineHP).toFixed(0)} к.с.` : (result.EngineKW ? `${(parseFloat(result.EngineKW) * 1.35962).toFixed(0)} к.с.` : "");

      let drive = "";
      if (result.DriveType) {
        const dType = result.DriveType.toLowerCase();
        if (dType.includes("awd") || dType.includes("4wd") || dType.includes("all wheel")) drive = "Повний привід";
        else if (dType.includes("rwd") || dType.includes("rear")) drive = "Задній привід";
        else if (dType.includes("fwd") || dType.includes("front")) drive = "Передній привід";
      }

      let transmission = "";
      if (result.TransmissionStyle) {
        const t = result.TransmissionStyle.toLowerCase();
        if (t.includes("continuously variable") || t.includes("cvt")) transmission = "Варіатор";
        else if (t.includes("manual")) transmission = "Механіка";
        else if (t.includes("automated manual") || t.includes("dual clutch") || t.includes("dct") || t.includes("robot")) transmission = "Робот";
        else if (t.includes("auto")) transmission = "Автомат";
      }

      return NextResponse.json({
        make,
        model,
        year,
        body,
        engine,
        drive,
        transmission,
        engineVol,
        power,
        raw: result // send raw data just in case frontend needs more
      });
    }

    return NextResponse.json({ error: "No data found for this VIN" }, { status: 404 });
  } catch (error) {
    console.error("VIN decode error:", error);
    return NextResponse.json({ error: "Failed to decode VIN" }, { status: 500 });
  }
}
