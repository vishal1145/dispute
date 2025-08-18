import React from "react";
import accountData from "../../Data/accountData.json";
import Header from "../../components/header";

export default function MyAccount() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <Header />

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white">
          <p className="mb-4 text-lg sm:text-xl font-bold">
            If required, please update your details and click the Update button.
          </p>

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accountData.map((field, index) => (
              <div
                key={index}
                className={`${field.fullWidth ? "sm:col-span-2" : ""}`}
              >
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    placeholder={field.placeholder || ""}
                    rows="1"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                  ></textarea>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder || ""}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                )}
              </div>
            ))}

            {/* Button Row */}
            <div className="col-span-1 sm:col-span-2 flex justify-center sm:justify-start">
              <button
                type="submit"
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded transition duration-200"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
