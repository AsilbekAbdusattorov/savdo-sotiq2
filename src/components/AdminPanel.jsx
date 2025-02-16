import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const AdminPanel = () => {
  const [product, setProduct] = useState({
    name: "",
    barcode: "",
    price: "",
    image: "",
  });

  // Kamera orqali barcode o'qish
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("barcode-scanner", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    // QR kodni dekodlash
    scanner.render(
      (decodedText) => {
        // Skanerlangan barcode qiymatini formga qo'shish
        setProduct((prev) => ({ ...prev, barcode: decodedText }));
        scanner.clear(); // Skaner tugagach tozalash
      },
      (errorMessage) => {
        console.log("Skaner xatosi:", errorMessage);
      }
    );

    // Ekranni tozalash
    return () => {
      scanner
        .clear()
        .catch((error) => console.log("Skanerni tozalashda xatolik:", error));
    };
  }, []); // Faqat komponent birinchi marta yuklanganda ishlaydi

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://savdo-sotiq.onrender.com/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!response.ok) throw new Error("Serverda xatolik yuz berdi!");

      alert("Mahsulot qo‘shildi!");
      setProduct({ name: "", barcode: "", price: "", image: "" });
    } catch (error) {
      alert("Xatolik: " + error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold mb-5 text-center text-gray-700">
        Mahsulot qo‘shish
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="name"
          placeholder="Mahsulot nomi"
          value={product.name}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <div className="flex gap-3 items-center">
          <input
            type="text"
            name="barcode"
            placeholder="Barcode"
            value={product.barcode}
            onChange={handleChange}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <input
          type="number"
          name="price"
          placeholder="Narx"
          value={product.price}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full p-3 border rounded-lg cursor-pointer"
          required
        />
        {product.image && (
          <img
            src={product.image}
            alt="Mahsulot rasmi"
            className="w-full h-40 object-cover rounded-lg shadow"
          />
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg shadow-lg hover:bg-blue-600"
        >
          Mahsulotni qo‘shish
        </button>
      </form>

      {/* Kamera orqali barcode skanerlash */}
      <div
        id="barcode-scanner"
        className="mt-5 p-3 border rounded-lg shadow-sm bg-gray-100"
      ></div>
    </div>
  );
};

export default AdminPanel;
