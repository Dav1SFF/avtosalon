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
      const body = result.BodyClass;
      const engine = result.DisplacementL ? `${parseFloat(result.DisplacementL).toFixed(1)} ${result.FuelTypePrimary === "Diesel" ? "дизель" : "бензин"}` : "";
      
      let drive = "";
      if (result.DriveType) {
        const dType = result.DriveType.toLowerCase();
        if (dType.includes("awd") || dType.includes("4wd") || dType.includes("all wheel")) drive = "Повний привід";
        else if (dType.includes("rwd") || dType.includes("rear")) drive = "Задній привід";
        else if (dType.includes("fwd") || dType.includes("front")) drive = "Передній привід";
      }

      return NextResponse.json({
        make,
        model,
        year,
        body,
        engine,
        drive,
        raw: result // send raw data just in case frontend needs more
      });
    }

    return NextResponse.json({ error: "No data found for this VIN" }, { status: 404 });
  } catch (error) {
    console.error("VIN decode error:", error);
    return NextResponse.json({ error: "Failed to decode VIN" }, { status: 500 });
  }
}
