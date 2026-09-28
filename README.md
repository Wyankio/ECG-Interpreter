# ECG Interpreter Lab

Real-data starter using the supplied 12-lead median ECG `.med` records.

The `.med` files in this dataset contain 6000 signed 16-bit samples. The first 12 samples form one time point across the 12 leads, followed by the next time point. Therefore each record is rendered as 12 leads × 500 samples.

Lead order used by the dataset: I, II, III, aVR, aVL, aVF, V1, V2, V3, V4, V5, V6. The limb-lead relationships in the first sample confirm the standard derivations (III≈II−I, aVR≈−(I+II)/2, aVL≈I−II/2, aVF≈II−I/2).

This repository contains only a small development subset extracted from the supplied dataset. Do not commit the full dataset.

Open `app/index.html` through a local web server because ES modules and fetch requests may be blocked by `file://`.
