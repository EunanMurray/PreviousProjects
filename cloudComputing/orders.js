function fetchOrders() {
    fetch('https://2g5lolmehl.execute-api.eu-west-1.amazonaws.com/prod/orders')
        .then(response => response.json())
        .then(orders => {
            console.log('Orders fetched:', orders);
            orders.forEach(order => {
                processOrder(order);
            });
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
        });
}

function processOrder(order) {
    const orderDetails = {
        orderID: order.OrderID,
        tableNumber: order.TableNumber,
        cocktails: []
    };

    const cocktailDetailsPromises = order.CocktailIDs.map(cocktailID =>
        fetchCocktailDetails(cocktailID)
    );

    Promise.all(cocktailDetailsPromises)
        .then(cocktailDetails => {
            orderDetails.cocktails = cocktailDetails;
            displayOrder(orderDetails);
        })
        .catch(error => {
            console.error('Error fetching cocktail details:', error);
        });
}

function fetchCocktailDetails(cocktailID) {
    return fetch(`https://2g5lolmehl.execute-api.eu-west-1.amazonaws.com/prod/CocktailDetails?cocktailID=${cocktailID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(cocktail => {
            console.log('Cocktail details fetched:', cocktail); 
            return cocktail; 
        })
        .catch(error => {
            console.error('Error fetching cocktail:', error);
            throw error; 
        });
}

function displayOrder(orderDetails) {
    const orderList = document.querySelector('#order-queue ul');
    const li = document.createElement('li');
    li.textContent = `Order #${orderDetails.orderID} - Table #${orderDetails.tableNumber}`;
    li.classList.add('order-item'); 
    li.onclick = () => showDetails(orderDetails);
    orderList.appendChild(li);
}

function showDetails(orderDetails) {
    const detailsDiv = document.getElementById('order-details');
    detailsDiv.innerHTML = `<h2>Order Details</h2>
                            <p><strong>Order Number:</strong> ${orderDetails.orderID}</p>
                            <p><strong>Table Number:</strong> ${orderDetails.tableNumber}</p>
                            ${orderDetails.cocktails.map(cocktail => `
                                <div>
                                    <h3>${cocktail.strDrink}</h3>
                                    <p><strong>Ingredients:</strong> ${formatIngredients(cocktail.Ingredients)}</p>
                                    <p><strong>Instructions:</strong> ${cocktail.strInstructions}</p>
                                    <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink} image">
                                </div>
                            `).join('')}`;
}

document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
        const orderId = e.target.dataset.orderId;
        markOrderAsComplete(orderId);
    }
});

/**function markOrderAsComplete(orderId) {
    const url = 'https://2g5lolmehl.execute-api.eu-west-1.amazonaws.com/prod/UpdateStatus';
    const body = JSON.stringify({
        orderId: orderId,
        status: 'Completed'
    });

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Update the UI to show the orders are now completed
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}**/


function formatIngredients(ingredients) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return 'No ingredients listed';
    }

    return ingredients.join(', ');
}

document.addEventListener('DOMContentLoaded', fetchOrders);
