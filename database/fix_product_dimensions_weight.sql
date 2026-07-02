-- Fix packaging weight (grams) + shipping box dimensions (cm) for all products.
-- weight_grams = product + retail box + padding (dead/shipping weight).
-- Corrects 0x0x0 rows, device/watch-face-scale rows, and mm-scale rows.
-- Generated for BoxDeal catalog (92 products).

BEGIN;

UPDATE products SET weight_grams = 1400, length_cm = 62, breadth_cm = 13, height_cm = 13, updated_at = now() WHERE sku = 'AMZ-ABTP04-BLK';
UPDATE products SET weight_grams = 420, length_cm = 13, breadth_cm = 12, height_cm = 11, updated_at = now() WHERE sku = 'AMAZON-ECHOPOP-BLK';
UPDATE products SET weight_grams = 500, length_cm = 28, breadth_cm = 18, height_cm = 4, updated_at = now() WHERE sku = 'AMZB-GRAPHICPAD-BLK';
UPDATE products SET weight_grams = 600, length_cm = 21, breadth_cm = 20, height_cm = 10, updated_at = now() WHERE sku = 'ANT-H520W-BLK';
UPDATE products SET weight_grams = 650, length_cm = 22, breadth_cm = 21, height_cm = 11, updated_at = now() WHERE sku = 'ANT-H580PRO-BLK';
UPDATE products SET weight_grams = 120, length_cm = 9, breadth_cm = 8, height_cm = 5, updated_at = now() WHERE sku = 'APPLE-MUVR3HNA';
UPDATE products SET weight_grams = 350, length_cm = 16, breadth_cm = 12, height_cm = 6, updated_at = now() WHERE sku = 'APPLE-45W-MAGSAFE2';
UPDATE products SET weight_grams = 330, length_cm = 12, breadth_cm = 10, height_cm = 6, updated_at = now() WHERE sku = 'APPLE-MW2L3HNA';
UPDATE products SET weight_grams = 150, length_cm = 12, breadth_cm = 7, height_cm = 3, updated_at = now() WHERE sku = 'APPLE-AIRPODS-1ST-GEN';
UPDATE products SET weight_grams = 900, length_cm = 26, breadth_cm = 19, height_cm = 5, updated_at = now() WHERE sku = 'APPLE-IPAD11-A16-128-SLV';
UPDATE products SET weight_grams = 400, length_cm = 16, breadth_cm = 11, height_cm = 9, updated_at = now() WHERE sku = 'APPLE-WATCHULTRA3-49-BLK';
UPDATE products SET weight_grams = 450, length_cm = 15, breadth_cm = 11, height_cm = 6, updated_at = now() WHERE sku = 'ARTIS-AR0501-65W';
UPDATE products SET weight_grams = 12500, length_cm = 35, breadth_cm = 35, height_cm = 72, updated_at = now() WHERE sku = 'BACKET-CLUB320-BLK';
UPDATE products SET weight_grams = 850, length_cm = 22, breadth_cm = 20, height_cm = 7, updated_at = now() WHERE sku = 'BEETEL-F1KPLUS-BLK';
UPDATE products SET weight_grams = 850, length_cm = 22, breadth_cm = 20, height_cm = 7, updated_at = now() WHERE sku = 'BEETEL-F2K-BLK';
UPDATE products SET weight_grams = 600, length_cm = 22, breadth_cm = 14, height_cm = 9, updated_at = now() WHERE sku = 'BEETEL-G30-BLK';
UPDATE products SET weight_grams = 700, length_cm = 21, breadth_cm = 17, height_cm = 9, updated_at = now() WHERE sku = 'BEETEL-M59N-BLK';
UPDATE products SET weight_grams = 620, length_cm = 22, breadth_cm = 13, height_cm = 8, updated_at = now() WHERE sku = 'BEETEL-M71N-ANT';
UPDATE products SET weight_grams = 700, length_cm = 21, breadth_cm = 14, height_cm = 12, updated_at = now() WHERE sku = 'BEETEL-X70-BLK';
UPDATE products SET weight_grams = 520, length_cm = 17, breadth_cm = 13, height_cm = 9, updated_at = now() WHERE sku = 'BEETEL-X73N-BLU';
UPDATE products SET weight_grams = 530, length_cm = 21, breadth_cm = 13, height_cm = 9, updated_at = now() WHERE sku = 'BEETEL-X75-BLU';
UPDATE products SET weight_grams = 520, length_cm = 17, breadth_cm = 10, height_cm = 8, updated_at = now() WHERE sku = 'BEETEL-X90-BLK';
UPDATE products SET weight_grams = 360, length_cm = 19, breadth_cm = 12, height_cm = 9, updated_at = now() WHERE sku = 'BEETEL-X92-BLK';
UPDATE products SET weight_grams = 180, length_cm = 18, breadth_cm = 12, height_cm = 4, updated_at = now() WHERE sku = 'BOYA-BYM1-BLK';
UPDATE products SET weight_grams = 150, length_cm = 18, breadth_cm = 12, height_cm = 4, updated_at = now() WHERE sku = 'BOYA-BYM3-BLK';
UPDATE products SET weight_grams = 900, length_cm = 26, breadth_cm = 22, height_cm = 7, updated_at = now() WHERE sku = 'CPP-CPUVR0401E1IC2-BLK';
UPDATE products SET weight_grams = 350, length_cm = 12, breadth_cm = 9, height_cm = 9, updated_at = now() WHERE sku = 'CPP-E24Q-WHT';
UPDATE products SET weight_grams = 2900, length_cm = 62, breadth_cm = 12, height_cm = 11, updated_at = now() WHERE sku = 'DIGITEK-DTR550LW-BLK';
UPDATE products SET weight_grams = 300, length_cm = 13, breadth_cm = 10, height_cm = 6, updated_at = now() WHERE sku = 'ENTER-EN65HP003-BLK';
UPDATE products SET weight_grams = 430, length_cm = 21, breadth_cm = 20, height_cm = 10, updated_at = now() WHERE sku = 'FRONTECH-HF-0015-BLK';
UPDATE products SET weight_grams = 1400, length_cm = 30, breadth_cm = 26, height_cm = 8, updated_at = now() WHERE sku = 'HIK-DS7108HGHIF1-WHT';
UPDATE products SET weight_grams = 400, length_cm = 20, breadth_cm = 9, height_cm = 9, updated_at = now() WHERE sku = 'HIK-DS2CE1AD0TITPECO';
UPDATE products SET weight_grams = 650, length_cm = 14, breadth_cm = 12, height_cm = 12, updated_at = now() WHERE sku = 'HIK-DS2DE2C400MWG4G';
UPDATE products SET weight_grams = 200, length_cm = 11, breadth_cm = 9, height_cm = 8, updated_at = now() WHERE sku = 'HUAWEI-WATCHFIT4PRO-BLK';
UPDATE products SET weight_grams = 300, length_cm = 22, breadth_cm = 15, height_cm = 3, updated_at = now() WHERE sku = 'HUION-H420X-BLK';
UPDATE products SET weight_grams = 450, length_cm = 24, breadth_cm = 16, height_cm = 3, updated_at = now() WHERE sku = 'HUION-H430P-BLK';
UPDATE products SET weight_grams = 600, length_cm = 30, breadth_cm = 21, height_cm = 4, updated_at = now() WHERE sku = 'HUION-HS64-BLK';
UPDATE products SET weight_grams = 2200, length_cm = 40, breadth_cm = 28, height_cm = 8, updated_at = now() WHERE sku = 'HUION-KAMVAS12-BLK';
UPDATE products SET weight_grams = 120, length_cm = 16, breadth_cm = 12, height_cm = 4, updated_at = now() WHERE sku = 'INF-GLD120BNRIN-BLK';
UPDATE products SET weight_grams = 250, length_cm = 13, breadth_cm = 11, height_cm = 5, updated_at = now() WHERE sku = 'JABRA-ELITE-75T-BLK';
UPDATE products SET weight_grams = 8200, length_cm = 100, breadth_cm = 22, height_cm = 14, updated_at = now() WHERE sku = 'JBL-CINEMASB241-BLK';
UPDATE products SET weight_grams = 9500, length_cm = 100, breadth_cm = 38, height_cm = 22, updated_at = now() WHERE sku = 'JBL-CINEMASB271-BLK';
UPDATE products SET weight_grams = 400, length_cm = 28, breadth_cm = 12, height_cm = 8, updated_at = now() WHERE sku = 'JBL-CSHM10-BLK';
UPDATE products SET weight_grams = 700, length_cm = 20, breadth_cm = 9, height_cm = 9, updated_at = now() WHERE sku = 'JBL-FLIP4-BLK';
UPDATE products SET weight_grams = 320, length_cm = 11, breadth_cm = 10, height_cm = 6, updated_at = now() WHERE sku = 'JBL-GO3-BLK';
UPDATE products SET weight_grams = 280, length_cm = 11, breadth_cm = 9, height_cm = 5, updated_at = now() WHERE sku = 'JBL-GOESSENTIAL';
UPDATE products SET weight_grams = 14000, length_cm = 40, breadth_cm = 38, height_cm = 66, updated_at = now() WHERE sku = 'JBL-PARTYBOX110-BLK';
UPDATE products SET weight_grams = 21000, length_cm = 46, breadth_cm = 42, height_cm = 78, updated_at = now() WHERE sku = 'JBL-PARTYBOX320-BLK';
UPDATE products SET weight_grams = 400, length_cm = 22, breadth_cm = 21, height_cm = 10, updated_at = now() WHERE sku = 'JBL-QTUM100M2-WHT';
UPDATE products SET weight_grams = 110, length_cm = 15, breadth_cm = 12, height_cm = 4, updated_at = now() WHERE sku = 'JBL-T215BT-BLK';
UPDATE products SET weight_grams = 1350, length_cm = 62, breadth_cm = 13, height_cm = 13, updated_at = now() WHERE sku = 'KODAK-T210-BLK';
UPDATE products SET weight_grams = 350, length_cm = 14, breadth_cm = 10, height_cm = 6, updated_at = now() WHERE sku = 'LAPCARE-65W-74MM-HP';
UPDATE products SET weight_grams = 13500, length_cm = 100, breadth_cm = 40, height_cm = 25, updated_at = now() WHERE sku = 'LG-S77TY-BLK';
UPDATE products SET weight_grams = 180, length_cm = 15, breadth_cm = 11, height_cm = 4, updated_at = now() WHERE sku = 'MAONO-AU400-BLK';
UPDATE products SET weight_grams = 800, length_cm = 24, breadth_cm = 16, height_cm = 10, updated_at = now() WHERE sku = 'MAONO-AU903-BLK';
UPDATE products SET weight_grams = 5200, length_cm = 47, breadth_cm = 24, height_cm = 37, updated_at = now() WHERE sku = 'MARQ-MQ60HT41-BLK';
UPDATE products SET weight_grams = 8000, length_cm = 95, breadth_cm = 38, height_cm = 28, updated_at = now() WHERE sku = 'MOTOROLA-AMPHISOUNDX350-BLK';
UPDATE products SET weight_grams = 900, length_cm = 28, breadth_cm = 19, height_cm = 5, updated_at = now() WHERE sku = 'MOTO-PAD60NEO-GRN';
UPDATE products SET weight_grams = 1100, length_cm = 32, breadth_cm = 21, height_cm = 5, updated_at = now() WHERE sku = 'MOTO-PAD60PRO-GRN';
UPDATE products SET weight_grams = 150, length_cm = 11, breadth_cm = 9, height_cm = 7, updated_at = now() WHERE sku = 'NOISE-QUADCALL-RPNK';
UPDATE products SET weight_grams = 160, length_cm = 11, breadth_cm = 9, height_cm = 8, updated_at = now() WHERE sku = 'NOISE-PULSE2PRO-BLK';
UPDATE products SET weight_grams = 150, length_cm = 11, breadth_cm = 9, height_cm = 7, updated_at = now() WHERE sku = 'NOISE-VORTEX-SPBLU';
UPDATE products SET weight_grams = 150, length_cm = 10, breadth_cm = 8, height_cm = 5, updated_at = now() WHERE sku = 'NOTHING-C298-WHT';
UPDATE products SET weight_grams = 110, length_cm = 13, breadth_cm = 11, height_cm = 4, updated_at = now() WHERE sku = 'OP-E306A-GRN';
UPDATE products SET weight_grams = 3400, length_cm = 45, breadth_cm = 30, height_cm = 20, updated_at = now() WHERE sku = 'PHL-MMS2625B-BLK';
UPDATE products SET weight_grams = 4600, length_cm = 48, breadth_cm = 35, height_cm = 22, updated_at = now() WHERE sku = 'PHL-SPA5128B-BLK';
UPDATE products SET weight_grams = 9500, length_cm = 55, breadth_cm = 42, height_cm = 38, updated_at = now() WHERE sku = 'PHL-SPA8000B-BLK';
UPDATE products SET weight_grams = 120, length_cm = 12, breadth_cm = 8, height_cm = 4, updated_at = now() WHERE sku = 'REALME-BUDS-AIR-NEO';
UPDATE products SET weight_grams = 120, length_cm = 16, breadth_cm = 12, height_cm = 4, updated_at = now() WHERE sku = 'RM-RMA2305-BLK';
UPDATE products SET weight_grams = 120, length_cm = 16, breadth_cm = 12, height_cm = 4, updated_at = now() WHERE sku = 'RM-BUDSW5ANC-BLK';
UPDATE products SET weight_grams = 850, length_cm = 27, breadth_cm = 18, height_cm = 5, updated_at = now() WHERE sku = 'REALME-PADWIFI4G-GRY';
UPDATE products SET weight_grams = 200, length_cm = 11, breadth_cm = 9, height_cm = 5, updated_at = now() WHERE sku = 'SAM-EPT4511NBNGIN-BLK';
UPDATE products SET weight_grams = 950, length_cm = 28, breadth_cm = 19, height_cm = 5, updated_at = now() WHERE sku = 'SAM-TABA9PLUS-5G-SLV';
UPDATE products SET weight_grams = 4500, length_cm = 92, breadth_cm = 25, height_cm = 18, updated_at = now() WHERE sku = 'SAM-HWT42EXL-BLK';
UPDATE products SET weight_grams = 140, length_cm = 10, breadth_cm = 8, height_cm = 5, updated_at = now() WHERE sku = 'SAM-EPT2510N-BLK';
UPDATE products SET weight_grams = 230, length_cm = 12, breadth_cm = 10, height_cm = 5, updated_at = now() WHERE sku = 'SAM-EPT4511-CABLE-BLK';
UPDATE products SET weight_grams = 140, length_cm = 12, breadth_cm = 10, height_cm = 5, updated_at = now() WHERE sku = 'SHKOD-AIRLITS7PRO';
UPDATE products SET weight_grams = 150, length_cm = 11, breadth_cm = 9, height_cm = 7, updated_at = now() WHERE sku = 'SHKOD-VEAIN-BLK';
UPDATE products SET weight_grams = 450, length_cm = 20, breadth_cm = 19, height_cm = 9, updated_at = now() WHERE sku = 'SKULL-HESH-ANC-BLK';
UPDATE products SET weight_grams = 16000, length_cm = 85, breadth_cm = 40, height_cm = 30, updated_at = now() WHERE sku = 'SONY-HTS20R-BLK';
UPDATE products SET weight_grams = 220, length_cm = 19, breadth_cm = 18, height_cm = 8, updated_at = now() WHERE sku = 'SONY-MDRZX110A-WHT';
UPDATE products SET weight_grams = 6500, length_cm = 48, breadth_cm = 42, height_cm = 40, updated_at = now() WHERE sku = 'SONY-SAD40M2-BLK';
UPDATE products SET weight_grams = 400, length_cm = 12, breadth_cm = 10, height_cm = 11, updated_at = now() WHERE sku = 'SONY-SRSXB100-BLK';
UPDATE products SET weight_grams = 1200, length_cm = 28, breadth_cm = 13, height_cm = 13, updated_at = now() WHERE sku = 'SONY-SRSXB33-RED';
UPDATE products SET weight_grams = 21500, length_cm = 40, breadth_cm = 42, height_cm = 78, updated_at = now() WHERE sku = 'SONY-SRSXP700-BLK';
UPDATE products SET weight_grams = 14500, length_cm = 36, breadth_cm = 34, height_cm = 64, updated_at = now() WHERE sku = 'SONY-SRSXV500-BLK';
UPDATE products SET weight_grams = 120, length_cm = 11, breadth_cm = 9, height_cm = 4, updated_at = now() WHERE sku = 'SONY-WF-L900-GRAY';
UPDATE products SET weight_grams = 700, length_cm = 24, breadth_cm = 21, height_cm = 8, updated_at = now() WHERE sku = 'SONY-WH1000XM4-BLK';
UPDATE products SET weight_grams = 300, length_cm = 19, breadth_cm = 18, height_cm = 8, updated_at = now() WHERE sku = 'SONY-MDRZX310AP-BLU';
UPDATE products SET weight_grams = 280, length_cm = 17, breadth_cm = 12, height_cm = 6, updated_at = now() WHERE sku = 'TRIGGR-TRINITY2-BLK';
UPDATE products SET weight_grams = 7800, length_cm = 24, breadth_cm = 46, height_cm = 23, updated_at = now() WHERE sku = 'WS-PWSSZS480-BLK';
UPDATE products SET weight_grams = 700, length_cm = 22, breadth_cm = 21, height_cm = 11, updated_at = now() WHERE sku = 'ZEB-JET-PRO-BB';

-- Fix meta price mismatch: selling_price is 3500 but meta text said 4200
UPDATE products SET
  meta_title = 'White Square 80W Bluetooth Party Speaker at ₹3500 | BoxDeal',
  meta_description = 'Buy White Square PWS SZS480 80W Party Speaker at ₹3500 (MRP ₹11999). BT 5.3, LED lights, mic & guitar input, 6hr battery. Free shipping on BoxDeal.',
  updated_at = now()
WHERE sku = 'WS-PWSSZS480-BLK';

COMMIT;
