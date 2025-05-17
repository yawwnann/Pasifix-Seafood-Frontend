export const FormInputSkeleton = () => (
  <div className="mb-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
    <div className="h-9 bg-gray-200 rounded w-full"></div>
  </div>
);

export const FormTextareaSkeleton = ({ taller = false }) => (
  <div className="mb-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
    <div
      className={` ${taller ? "h-24" : "h-20"} bg-gray-200 rounded w-full`}
    ></div>
    {taller && <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>}
  </div>
);

export const CartItemSkeleton = () => (
  <div className="flex justify-between items-center py-3 border-b last:border-b-0 animate-pulse">
    <div className="flex items-center flex-grow mr-3">
      <div className="w-16 h-16 bg-gray-200 rounded mr-3 flex-shrink-0"></div>
      <div className="flex-grow space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
    <div className="h-5 bg-gray-200 rounded w-1/6 flex-shrink-0"></div>
  </div>
);

export const CheckoutPageSkeleton = () => (
  <div className="container mx-auto px-4">
    <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-8 animate-pulse"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-6 border-b border-gray-200 pb-4"></div>
        <FormInputSkeleton />
        <FormInputSkeleton />
        <FormTextareaSkeleton taller={true} />
        <FormTextareaSkeleton />
      </div>
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-6 border-b border-gray-200 pb-4"></div>
        <CartItemSkeleton />
        <CartItemSkeleton />
        <CartItemSkeleton />
        <div className="pt-4 border-t border-gray-200 mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-300 rounded w-1/3 font-bold"></div>
            <div className="h-6 bg-gray-300 rounded w-2/5 font-bold"></div>
          </div>
        </div>
        <div className="h-12 bg-gray-300 rounded-lg mt-8 w-full"></div>
      </div>
    </div>
  </div>
);
