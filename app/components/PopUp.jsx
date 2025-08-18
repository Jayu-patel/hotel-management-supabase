const ConfirmationPopup = ({showPopup, handleConfirm, handleCancel, header, message, btnMessage}) => {
  return (
    <div className="relative">
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-800">
              {header}
            </h2>
            <p className="text-gray-600 mt-2">
              {message}
            </p>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 cursor-pointer"
              >
                {btnMessage}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmationPopup;