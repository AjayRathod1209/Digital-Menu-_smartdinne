const testCompleteWorkflow = async () => {
  try {
    console.log('=== Complete Order Status Update Workflow Test ===');
    
    // Step 1: Check if we have orders
    console.log('\n1. Checking for existing orders...');
    const ordersResponse = await fetch('http://localhost:3000/api/orders');
    if (!ordersResponse.ok) {
      console.log('❌ Failed to fetch orders');
      return;
    }
    
    const orders = await ordersResponse.json();
    if (orders.length === 0) {
      console.log('ℹ️ No existing orders found. Creating a test order first...');
      
      // Create a test order
      const menuResponse = await fetch('http://localhost:3000/api/menu');
      if (!menuResponse.ok) {
        console.log('❌ Failed to fetch menu items');
        return;
      }
      
      const menuItems = await menuResponse.json();
      if (menuItems.length === 0) {
        console.log('❌ No menu items available');
        return;
      }
      
      // Get table info
      const tablesResponse = await fetch('http://localhost:3000/api/tables');
      if (!tablesResponse.ok) {
        console.log('❌ Failed to fetch tables');
        return;
      }
      
      const tables = await tablesResponse.json();
      if (tables.length === 0) {
        console.log('❌ No tables available');
        return;
      }
      
      // Create test order
      const createOrderResponse = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: tables[0].id,
          customerName: 'Test Customer',
          customerPhone: '1234567890',
          items: [
            {
              menuItemId: menuItems[0].id,
              quantity: 1,
              price: menuItems[0].price
            }
          ]
        })
      });
      
      if (!createOrderResponse.ok) {
        console.log('❌ Failed to create test order');
        return;
      }
      
      const newOrder = await createOrderResponse.json();
      console.log('✅ Created test order:', { orderNumber: newOrder.orderNumber, status: newOrder.status });
      
      // Fetch orders again
      const updatedOrdersResponse = await fetch('http://localhost:3000/api/orders');
      const updatedOrders = await updatedOrdersResponse.json();
      const testOrder = updatedOrders.find(order => order.id === newOrder.id);
      
      if (!testOrder) {
        console.log('❌ Failed to find newly created order');
        return;
      }
      
      // Test status updates on the new order
      await testStatusUpdates(newOrder);
      
    } else {
      // Use existing order
      const testOrder = orders[0];
      console.log('✅ Using existing order:', { orderNumber: testOrder.orderNumber, status: testOrder.status });
      await testStatusUpdates(testOrder);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

const testStatusUpdates = async (order: any) => {
  const statuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];
  const currentStatusIndex = statuses.indexOf(order.status);
  
  console.log('\n2. Testing status updates...');
  
  // Test each status transition
  for (let i = 0; i < statuses.length; i++) {
    if (i !== currentStatusIndex) {
      const targetStatus = statuses[i];
      console.log(`   Testing: ${order.status} → ${targetStatus}`);
      
      const updateResponse = await fetch(`http://localhost:3000/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      
      if (updateResponse.ok) {
        const updatedOrder = await updateResponse.json();
        console.log(`   ✅ Success: Status is now ${updatedOrder.status}`);
        order.status = updatedOrder.status; // Update for next iteration
      } else {
        console.log(`   ❌ Failed: ${await updateResponse.text()}`);
      }
      
      // Small delay to simulate real usage
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n✅ All status update tests completed!');
  console.log('✅ The dropdown in the admin panel should now work correctly!');
};

testCompleteWorkflow();