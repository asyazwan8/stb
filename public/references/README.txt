Reference portraits for each live look. Keep the filenames identical when
replacing one, and update `aspect` in lib/ethnics.ts if the pixel size changes.

  iban-female.jpeg       Iban — Ngepan Indu
  iban-male.jpeg         Iban — Ngepan Lelaki
  bidayuh-female.png     Bidayuh — women's dress
  bidayuh-male.png       Bidayuh — warrior's dress
  orangulu-female.png    Orang Ulu — Kenyah dancer
  orangulu-male.png      Orang Ulu — Kenyah warrior

Portrait orientation, ideally 1000-1600px on the long edge. Use photos without
watermarks: the face swap keeps everything in the reference except the face.
After replacing, check the hotspots still line up: open the learn screen with
?calibrate=1 and tap to read new coordinates, then update lib/ethnics.ts.
