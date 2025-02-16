import React, { useEffect, useRef, useState } from "react";

const Home = () => {
  const videoRef = useRef(null);
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    startCamera();
    loadQuagga();
  }, []);

  // Kamera ishga tushirish
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Kameraga ruxsat berilmadi:", error);
      alert("Iltimos, kameraga ruxsat bering!");
    }
  };

  // QuaggaJS yuklash
  const loadQuagga = () => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js";
    script.onload = initQuagga;
    document.body.appendChild(script);
  };

  // QuaggaJS boshlash
  const initQuagga = () => {
    if (!window.Quagga) return;

    window.Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            facingMode: "environment",
          },
          willReadFrequently: true,
        },
        decoder: {
          readers: ["ean_reader", "code_128_reader"],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error("QuaggaJS xatosi:", err);
          return;
        }
        window.Quagga.start();
      }
    );

    // Skanerlangan barcode
    window.Quagga.onDetected((result) => {
      const scannedBarcode = result.codeResult.code;
      setBarcode(scannedBarcode);
      fetchProductData(scannedBarcode);
      window.Quagga.stop();
    });
  };

  // 📌 JSON-dan mahsulot ma'lumotlarini olish
  const fetchProductData = async (barcode) => {
    try {
      const response = await fetch("https://savdo-sotiq.onrender.com/products"); // Mahsulotlar ro‘yxatini serverdan olish
      const data = await response.json();
      const foundProduct = data.find((item) => item.barcode === barcode);
      if (foundProduct) {
        setProduct(foundProduct);
        setTotalPrice(foundProduct.price * quantity);
      } else {
        alert("Mahsulot topilmadi!");
      }
    } catch (error) {
      console.error("JSON o‘qishda xatolik:", error);
    }
  };

  // 🔄 Narxni yangilash
  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value, 10);
    setQuantity(qty);
    setTotalPrice(product.price * qty);
  };

  // 📌 Sotish tugmasi bosilganda JSON-ga yozish
  const handleSell = async () => {
    const saleData = {
      barcode: product.barcode,
      name: product.name,
      price: product.price,
      quantity: quantity,
      total: totalPrice,
    };

    try {
      const response = await fetch("https://savdo-sotiq.onrender.com/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        alert("Mahsulot sotildi!");
        setBarcode("");
        setProduct(null);
        setQuantity(1);
        setTotalPrice(0);
        startCamera(); // Kamera qayta ishga tushsin
      } else {
        alert("Xatolik yuz berdi, qayta urinib ko‘ring!");
      }
    } catch (error) {
      console.error("Ma'lumotni saqlashda xatolik:", error);
    }
  };

  return (
    <section className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold mb-5 text-center text-gray-700">📷 Barcode Skanner</h2>

      {/* Kamera */}
      <video ref={videoRef} className="w-full h-60 border rounded-lg shadow-sm bg-black" autoPlay muted></video>

      {/* Skaner natijasi */}
      {product && (
        <div className="mt-4 p-3 border rounded-lg bg-gray-100">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg mt-2" />
          <p className="text-xl font-bold text-blue-600">Narxi: {product.price} so‘m</p>

          {/* Nechta sotib olish */}
          <label className="block mt-2">
            <span className="text-gray-600">Soni:</span>
            <input
              type="number"
              value={quantity}
              min="1"
              className="w-full p-2 border rounded-lg"
              onChange={handleQuantityChange}
            />
          </label>

          {/* Jami narx */}
          <p className="text-lg font-semibold mt-2">Jami: {totalPrice} so‘m</p>

          {/* Sotish tugmasi */}
          <button
            onClick={handleSell}
            className="w-full mt-3 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            ✅ Sotish
          </button>
        </div>
      )}
    </section>
  );
};

export default Home;
