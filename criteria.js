export function rateCategory(bpm){return bpm<60?"bradycardia":bpm>100?"tachycardia":"normal"}
export function prCategory(ms){return ms==null?"not measurable":ms<120?"short":ms<=200?"normal":"prolonged"}
export function qrsCategory(ms){return ms<120?"narrow":"wide"}
export function pathologicalQ(durationMs,depthMm,qRPercent){return durationMs>=40||depthMm>=2||qRPercent>=25}
