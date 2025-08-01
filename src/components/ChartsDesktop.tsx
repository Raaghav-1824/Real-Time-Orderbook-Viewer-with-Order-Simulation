import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { OrderImpactPanel } from "./orderbook/OrderImpactPanel";
import { useSimulationStore } from "@/store/simulationStore";
function ChartsDesktop() {
  
  const { currentSimulation, isSimulating } = useSimulationStore();

  return (
    <div className="flex flex-col h-full ">
      {/* Market Depth Chart - 2/3 of the space */}
      {/* <Card className="flex-[2] min-h-0">
        <CardHeader className="pb-2">
          <CardTitle>Market Depth</CardTitle>
        </CardHeader>
        <CardContent className="h-full pb-4"> */}
          {/* <div className="h-full bg-gray-700 rounded-md flex items-center justify-center text-gray-400">
            D3 Chart Coming Next
          </div> */}
        {/* </CardContent>
      </Card> 
      
      {/* Order Metrics - 1/3 of the space */}
      <Card className="flex-[1] min-h-0">
        <CardHeader className="pb-2">
          <CardTitle>Order Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
      
        <OrderImpactPanel 
          metrics={currentSimulation?.metrics || null}
          isLoading={isSimulating}
        />
        </CardContent>
      </Card>
    </div>
  );
}


  export default ChartsDesktop;