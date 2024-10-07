import { useState, useEffect } from "react";

const API_KEY = import.meta.env.VITE_CAT_API_KEY;
const API_URL = "https://api.thecatapi.com/v1/images/search";

const banCategories = ["origin", "weight", "life_span"];
const displayCategories = [
  "origin",
  "weight",
  "life_span",
  "temperament",
  "wikipedia_url",
];

export default function CatDiscoveryApp() {
  const [cat, setCat] = useState(null);
  const [banList, setBanList] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [seenCats, setSeenCats] = useState([]);

  const fetchRandomCat = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}?api_key=${API_KEY}&has_breeds=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const newCat = data[0];
        if (newCat.breeds && newCat.breeds.length > 0) {
          const breed = newCat.breeds[0];
          if (isCatAllowed(breed)) {
            setCat(newCat);
            setSeenCats((prev) => [
              ...prev,
              {
                name: breed.name,
                origin: breed.origin,
                image: newCat.url,
              },
            ]);
          } else {
            fetchRandomCat(); // Fetch again if the cat is banned
          }
        }
      }
    } catch (error) {
      console.error("Error fetching cat:", error);
    }
    setIsLoading(false);
  };

  const isCatAllowed = (breed) => {
    return !Object.entries(banList).some(([category, bannedValues]) => {
      const breedValue = getBreedValue(breed, category);
      return bannedValues.includes(breedValue);
    });
  };

  const getBreedValue = (breed, category) => {
    if (category === "weight") {
      return breed.weight.metric;
    }
    if (category === "life_span") {
      return breed.life_span;
    }
    if (category === "country_code") {
      return breed.country_code;
    }
    return breed[category];
  };

  useEffect(() => {
    fetchRandomCat();
  }, []);

  const handleBan = (category, value) => {
    if (banCategories.includes(category)) {
      setBanList((prevList) => ({
        ...prevList,
        [category]: [...(prevList[category] || []), value],
      }));
    }
  };

  const handleUnban = (category, value) => {
    setBanList((prevList) => ({
      ...prevList,
      [category]: prevList[category].filter((item) => item !== value),
    }));
  };

  const resetSearch = () => {
    setSeenCats([]);
    setBanList({});
    fetchRandomCat();
  };

  const renderCatAttribute = (category) => {
    if (!cat) return null;
    const breed = cat.breeds[0];
    let value = getBreedValue(breed, category);

    if (category === "wikipedia_url") {
      return (
        <div key={category} className="flex items-center justify-between">
          <p className="text-gray-600 capitalize">
            Wikipedia:{" "}
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-800 underline"
            >
              Learn More
            </a>
          </p>
        </div>
      );
    }

    return (
      <div key={category} className="flex items-center justify-between">
        <p className="text-gray-600 capitalize">
          {category.replace("_", " ")}:{" "}
          <span className="font-medium text-gray-800">{value}</span>
        </p>
        {banCategories.includes(category) && (
          <button
            onClick={() => handleBan(category, value)}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-3 ml-4 rounded-full transition duration-300 ease-in-out"
          >
            Ban
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-4 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:space-x-8">
        <div className="lg:w-1/3 flex flex-col space-y-8 mb-8 lg:mb-0">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                Recently Seen Cats
              </h2>
              <div className="space-y-4 max-h-[30vh] lg:max-h-[calc(50vh-100px)] overflow-y-auto">
                {seenCats.map((seenCat, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <img
                      src={seenCat.image}
                      alt={seenCat.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        {seenCat.name}
                      </p>
                      <p className="text-sm text-gray-600">{seenCat.origin}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                Ban List
              </h2>
              <div className="max-h-[30vh] lg:max-h-[calc(50vh-100px)] overflow-y-auto">
                {Object.entries(banList).map(([category, values]) => {
                  if (values.length === 0) return null; // Don't render anything if there are no banned items
                  return (
                    <div key={category} className="mb-4">
                      <h3 className="text-lg font-medium text-gray-700 capitalize mb-2">
                        {category.replace("_", " ")}:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value, index) => (
                          <span
                            key={index}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {value}
                            <button
                              onClick={() => handleUnban(category, value)}
                              className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:w-2/3 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Here Kitty Kitty
                </h1>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  A Cat Discovery App
                </h2>
              </div>
              <button
                onClick={resetSearch}
                disabled={isLoading}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Search
              </button>
            </div>
            <div className="mb-8">
              <button
                onClick={fetchRandomCat}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Fetching Cat..." : "Discover New Cat"}
              </button>
            </div>
            {cat && (
              <div className="space-y-6">
                <div className="w-full mx-auto h-64 sm:h-96 rounded-lg overflow-hidden">
                  <img
                    src={cat.url}
                    alt="Random cat"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    {cat.breeds[0].name}
                  </h2>
                  {displayCategories.map(renderCatAttribute)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
