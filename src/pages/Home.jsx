import React, { useEffect, useRef, useState } from "react";

const Home = () => {
  const videoRef = useRef(null);
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    startCamera();
  }, []);

  useEffect(() => {
    loadQuagga();
  }, [videoRef.current]);

  // 📸 Kamera ishga tushirish
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Old yoki orqa kamera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("🚨 Kamera ishlamayapti:", error);
      alert("Kameraga ruxsat bering!");
    }
  };

  // 📦 QuaggaJS yuklash
  const loadQuagga = () => {
    if (!videoRef.current) return;

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js";
    script.onload = () => {
      if (window.Quagga) {
        initQuagga();
      }
    };
    document.body.appendChild(script);
  };

  // 📡 QuaggaJS boshlash
  const initQuagga = () => {
    if (!window.Quagga || !videoRef.current) return;

    window.Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: { facingMode: "environment" },
        },
        decoder: {
          readers: ["ean_reader", "code_128_reader", "upc_reader"], // Qo‘shimcha formatlar qo‘shildi
        },
        locate: true,
        halfSample: true, // Performance uchun
      },
      (err) => {
        if (err) {
          console.error("🚨 QuaggaJS xatosi:", err);
          return;
        }
        window.Quagga.start();
      }
    );

    window.Quagga.onDetected((result) => {
      const scannedBarcode = result.codeResult.code;
      console.log("✅ Skanner topdi:", scannedBarcode);
      setBarcode(scannedBarcode);
      fetchProductData(scannedBarcode);
      window.Quagga.stop();
      setTimeout(() => window.Quagga.start(), 1000); // 1s keyin qayta skan
    });
  };
  const fetchProductData = async (barcode) => {
    try {
      const response = await fetch("https://savdo-sotiq.onrender.com/products");
      const data = await response.json();
      console.log("📦 JSON dan kelgan data:", data); // 👈 Yangi qo‘shamiz

      const foundProduct = data.find((item) => item.barcode === barcode);
      console.log("🔎 Topilgan mahsulot:", foundProduct); // 👈 Yangi qo‘shamiz

      if (foundProduct) {
        setProduct(foundProduct);
        setTotalPrice(foundProduct.price * quantity);
      } else {
        alert("🚨 Mahsulot topilmadi!");
      }
    } catch (error) {
      console.error("JSON o‘qishda xatolik:", error);
    }
  };

  // 🏷 Narxni yangilash
  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value, 10);
    setQuantity(qty);
    setTotalPrice(product.price * qty);
  };

  // 🛍 Sotish
  const handleSell = async () => {
    const saleData = {
      barcode: product.barcode,
      name: product.name,
      price: product.price,
      quantity,
      total: totalPrice,
    };

    try {
      const response = await fetch("https://savdo-sotiq.onrender.com/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        alert("✅ Mahsulot sotildi!");
        setBarcode("");
        setProduct(null);
        setQuantity(1);
        setTotalPrice(0);
        window.Quagga.start();
      } else {
        alert("🚨 Xatolik yuz berdi!");
      }
    } catch (error) {
      console.error("Ma’lumot saqlashda xatolik:", error);
    }
  };

  return (
    <section className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold mb-5 text-center text-gray-700">
        📷 Barcode Skanner
      </h2>

      {/* 📸 Kamera */}
      <video
        ref={videoRef}
        className="w-full h-60 border rounded-lg shadow-sm bg-black"
        autoPlay
        muted
      ></video>

      {/* 📦 Skan qilingan mahsulot */}
      {product && (
        <div className="mt-4 p-3 border rounded-lg bg-gray-100">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-40 object-cover rounded-lg mt-2"
          />
          <p className="text-xl font-bold text-blue-600">
            Narxi: {product.price} so‘m
          </p>

          {/* 🔢 Nechta sotib olish */}
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

          {/* 💰 Jami narx */}
          <p className="text-lg font-semibold mt-2">Jami: {totalPrice} so‘m</p>

          {/* ✅ Sotish tugmasi */}
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
