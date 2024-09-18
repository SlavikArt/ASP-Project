document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.id == 'shop-group-form') {
        e.preventDefault();
        console.log('submit prevented');
        const formData = new FormData(form);
        fetch("/api/group", {
            method: 'POST',
            body: formData
        }).then(r => r.json()).then(j => {
            if (j.status == 'OK') {
                window.location.reload();
            } else {
                alert(j.message);

                form.querySelectorAll('.invalid-feedback, .valid-feedback').forEach(el => el.remove());
                form.querySelectorAll('.is-invalid, .is-valid').forEach(el => el.classList.remove('is-invalid', 'is-valid'));

                if (j.errors) {
                    for (const [key, value] of Object.entries(j.errors)) {
                        const input = form.querySelector(`[name="${key}"]`);

                        if (input) {
                            if (value) {
                                input.classList.add('is-invalid');
                                const feedback = document.createElement('div');
                                feedback.className = 'invalid-feedback';
                                feedback.innerText = value;
                                input.parentNode.appendChild(feedback);
                            } else {
                                input.classList.add('is-valid');
                                const feedback = document.createElement('div');
                                feedback.className = 'valid-feedback';
                                feedback.innerText = 'Поле заповнено правильно';
                                input.parentNode.appendChild(feedback);
                            }
                        }
                    }
                }
            }
        });
    }
    else if (form.id == 'shop-product-form') {
        e.preventDefault();
        const formData = new FormData(form);
        fetch("/api/product", {
            method: 'POST',
            body: formData
        }).then(r => r.json()).then(j => {
            if (j.status == 'OK') {
                // alert('Додано успішно');
                window.location.reload();
            } else {
                alert(j.message);
                
                form.querySelectorAll('.invalid-feedback, .valid-feedback').forEach(el => el.remove());
                form.querySelectorAll('.is-invalid, .is-valid').forEach(el => el.classList.remove('is-invalid', 'is-valid'));

                if (j.errors) {
                    for (const [key, value] of Object.entries(j.errors)) {
                        const input = form.querySelector(`[name="${key}"]`);
                        if (input) {
                            if (value) {
                                input.classList.add('is-invalid');
                                const feedback = document.createElement('div');
                                feedback.className = 'invalid-feedback';
                                feedback.innerText = value;
                                input.parentNode.appendChild(feedback);
                            } else {
                                input.classList.add('is-valid');
                                const feedback = document.createElement('div');
                                feedback.className = 'valid-feedback';
                                feedback.innerText = 'Поле заповнено правильно';
                                input.parentNode.appendChild(feedback);
                            }
                        }
                    }
                }
            }
        });
    }

});


document.addEventListener('DOMContentLoaded', () => {
    const modalFeedbackButton = document.getElementById("modal-feedback-button");
    if (modalFeedbackButton) modalFeedbackButton.addEventListener("click", productFeedbackClick);
    else console.error("modal-feedback-button not found");

    const authButton = document.getElementById("auth-button");
    if (authButton) authButton.addEventListener('click', authClick);
    else console.error("auth-button not found");

    const logOutButton = document.getElementById("log-out-button");
    if (logOutButton) logOutButton.addEventListener('click', logOutClick);

    const profileEditButton = document.getElementById("profile-edit");
    if (profileEditButton) profileEditButton.addEventListener('click', profileEditClick);

    const profileDeleteButton = document.getElementById("profile-delete");
    if (profileDeleteButton) profileDeleteButton.addEventListener('click', profileDeleteClick);

    const recoveryButton = document.getElementById("recovery-button")
    if (recoveryButton) recoveryButton.addEventListener('click', recoveryClick)

    const closeButton = document.getElementById("close-button")
    if (closeButton) closeButton.addEventListener('click', closeClick)

    const productFeedbackButton = document.getElementById("product-feedback-button")
    if (productFeedbackButton) productFeedbackButton.addEventListener('click', productFeedbackClick)

    for (const btn of document.querySelectorAll('[data-role="feedback-edit"]')) {
        btn.addEventListener('click', feedbackEditClick)
    }

    for (const btn of document.querySelectorAll('[data-role="feedback-delete"]')) {
        btn.addEventListener('click', feedbackDeleteClick)
    }

    for (const btn of document.querySelectorAll('[data-role="feedback-recovery"]')) {
        btn.addEventListener('click', feedbackRecoveryClick)
    }

    document.querySelectorAll('[data-role="add-to-cart"]').forEach(button => {
        button.addEventListener('click', addToCart);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('input[name="price"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const selectedPrice = parseFloat(this.value);
            document.querySelectorAll('.product-item').forEach(item => {
                const productPrice = parseFloat(item.getAttribute('data-price'));
                if (productPrice <= selectedPrice) {
                    item.style.display = 'inline-block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    document.getElementById('reset-filters')?.addEventListener('click', function () {
        document.querySelectorAll('input[name="price"]').forEach(radio => {
            radio.checked = false;
        });
        document.querySelectorAll('.product-item').forEach(item => {
            item.style.display = 'inline-block';
        });
    });

});


function showToast(message, color) {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        backgroundColor: color,
    }).showToast();
}


function authModalCall() {
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    authModal.show();
}

function addToCart(event) {
    const parentBlock = event.target.closest('.product-to-cart');
    if (!parentBlock) {
        console.error('Parent block not found');
        return;
    }

    const button = event.target.closest('[data-role="add-to-cart"]');
    if (!button) {
        console.error('Add to Cart button not found');
        return;
    }

    const productId = button.getAttribute('data-product-id');
    const userId = document.querySelector('[data-role="user-id"]').value;

    if (!userId) {
        alert("Треба увійти в систему");
        authModalCall();
        return
    }

    console.log('Parent Block:', parentBlock);
    console.log('Button:', button);
    console.log('Product ID:', productId);
    console.log('User ID:', userId);

    fetch('/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, productId, count: 1 })
    })
        .then(response => {
            console.log('Response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Response Data:', data);
            if (data.meta.service === 'Cart' && data.data === 'Added') {
                button.parentElement.innerHTML = `
                <div class="in-the-cart">У кошику: </div>
                <div class="quantity-controls">
                    <button class="btn-decrement" onclick="decrementClickProduct(event)">-</button>
                    <b class="quantity" data-role="cart-product-cnt">1</b>
                    <input type="hidden" data-role="cart-product-id" value="${data.meta.cartProductId}">
                    <button class="btn-increment" onclick="incrementClickProduct(event)">+</button>
                </div>`;
                showToast("Додано успішно", "#4CAF50");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function updateCartProduct(event, increment) {
    const parentBlock = event.target.closest('.product-to-cart');
    if (!parentBlock) {
        console.error('Parent block not found');
        return;
    }

    const productId = parentBlock.getAttribute('data-product-id');
    const userId = document.querySelector('[data-role="user-id"]').value;
    const cartProductId = parentBlock.querySelector('[data-role="cart-product-id"]').value;
    const countBlock = parentBlock.querySelector('[data-role="cart-product-cnt"]');

    console.log('Parent Block:', parentBlock);
    console.log('Product ID:', productId);
    console.log('User ID:', userId);
    console.log('Cart Product ID:', cartProductId);
    console.log('Increment:', increment);

    fetch(`/api/cart?increment=${increment}&cpId=${cartProductId}`, { method: 'PUT' })
        .then(response => response.json())
        .then(data => {
            console.log('Response Data:', data);
            if (data.meta.count === 0) {
                parentBlock.innerHTML = `
                    <button class="btn btn-outline-success btn-to-cart" data-product-id="${productId}" data-user-id="${userId}" data-role="add-to-cart">
                        <i class="bi bi-cart3"></i> До кошику
                    </button>`;
                const newButton = parentBlock.querySelector('[data-role="add-to-cart"]');
                newButton.addEventListener('click', addToCart);
            } else {
                countBlock.innerHTML = data.meta.count;
                if (increment === 1) {
                    showToast("Кількість збільшена на 1 шт.", "#4CAF50");
                } else if (increment === -1) {
                    showToast("Кількість зменшена на 1 шт.", "#FF0000");
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function decrementClickProduct(event) {
    updateCartProduct(event, -1);
}

function incrementClickProduct(event) {
    updateCartProduct(event, 1);
}


function feedbackDeleteClick(e) {
    const feedbackId = e.target.closest('[data-feedback-id]').getAttribute('data-feedback-id');
    if (confirm("Впевнені, що хочете видалити відгук?")) {
        fetch("/api/feedback?id=" + feedbackId, { method: 'DELETE' })
            .then(r => r.json())
            .then(j => {
                if (j.data === "Deleted") {
                    window.location.reload();
                } else {
                    console.log(j);
                    alert("Щось пішло не так");
                    
                }
            });
        console.log(feedbackId);
    }
}

function feedbackEditClick(e) {
    const feedbackId = e.target.closest('[data-feedback-id]').getAttribute('data-feedback-id');
    let text = document.querySelector(`[data-feedback-id="${feedbackId}"][data-role="feedback-text"]`).innerText;
    let rate = document.querySelector(`[data-feedback-id="${feedbackId}"][data-role="feedback-rate"]`).getAttribute('data-value');

    document.getElementById("modal-feedback-rate").value = rate;
    document.getElementById("modal-feedback").value = text;
    document.getElementById("feedbackModalLabel").innerText = 'Редагувати відгук';
    document.getElementById("modal-feedback-button").textContent = "Редагувати";
    document.getElementById("modal-feedback-button").setAttribute('data-edit-id', feedbackId);

    new bootstrap.Modal(document.getElementById('feedbackModal')).show();
}

function productFeedbackClick(e) {
    const textarea = document.getElementById("modal-feedback");
    const userId = textarea.getAttribute("data-user-id");
    const productId = textarea.getAttribute("data-product-id");
    const timeStamp = textarea.getAttribute("data-timestamp");
    const rate = document.getElementById("modal-feedback-rate").value;
    var text = textarea.value.trim();
    const editId = e.target.getAttribute('data-edit-id');

    if (editId) {
        fetch("/api/feedback", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ editId, text, rate })
        })
            .then(r => r.json())
            .then(j => {
                if (j.data === "Updated") {
                    window.location.reload();
                } else {
                    alert("Щось пішло не так");
                }
            });
    } else {
        fetch("/api/feedback", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, productId, text, timeStamp, rate })
        })
            .then(r => r.json())
            .then(j => {
                if (j.data === "Created") {
                    window.location.reload();
                } else {
                    alert("Щось пішло не так");
                }
            });
    }
}

function feedbackRecoveryClick(e) {
    const feedbackId = e.target.closest('[data-feedback-id]').getAttribute('data-feedback-id')
    if (confirm("Впевнені, що хочете видалити відгук?")) {
        fetch("/api/feedback?id=" + feedbackId, {
            method: 'RECOVERY'
        }).then(r => r.json()).then(j => {
            if (j.data === "Recovered") {
                window.location.reload()
            } else {
                alert("Щось пішло не так")
            }
        })
        console.log(feedbackId)
    }
}

function profileDeleteClick(e) {
    if (confirm("Підтверджуєте видалення облікового запису?")) {
        fetch(
            "/api/auth", {
            method: "UNLINK",
        })
        .then(r => r.json())
        .then(j => {
            if (j.status == "OK") {
                window.location = "/";
            }
            else {
                alert(j.message);
            }
        });
    }
}

function profileEditClick(e) {
    const btn = e.target;
    const isEditFinish = btn.classList.contains('bi-check2-square');
    if (isEditFinish) {
        btn.classList.remove('bi-check2-square');
        btn.classList.add('bi-pencil-square');
    } else {
        btn.classList.add('bi-check2-square');
        btn.classList.remove('bi-pencil-square');
    }

    let changes = {};
    for (let elem of document.querySelectorAll('[profile-editable]')) {
        if (isEditFinish) {
            elem.removeAttribute('contenteditable');
            if (elem.initialText != elem.innerText) {
                const fieldName = elem.getAttribute('profile-editable');
                changes[fieldName] = elem.innerText;
            }
        } else {
            elem.setAttribute('contenteditable', 'true');
            elem.initialText = elem.innerText;
        }
    }

    if (isEditFinish) {
        if (Object.keys(changes).length > 0) {
            console.log(changes);
            fetch("/api/auth", {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(changes)
            }).then(r => r.json())
                .then(j => {
                    if (j.status == "OK") {
                        alert(j.message);
                    } else {
                        for (let elem of document.querySelectorAll('[profile-editable]')) {
                            elem.setAttribute('contenteditable', 'true');
                        }
                        btn.classList.add('bi-check2-square');
                        btn.classList.remove('bi-pencil-square');
                        alert(j.message);
                    }
                });
        } else {
            console.log("No changes");
        }
    }
}

function logOutClick() {
    fetch('/api/auth', {
        method: 'DELETE'
    }).then(r => location.reload());
}

function authClick() {
    const emailInput = document.querySelector('[name="auth-user-email"]');
    if (!emailInput) throw '[name="auth-user-email"] not found';

    const passwordInput = document.querySelector('[name="auth-user-password"]');
    if (!passwordInput) throw '[name="auth-user-password"] not found';

    const recoveryInput = document.querySelector('[name="registration-date"]')
    if (!recoveryInput) console.log('[name="registration-date"] not found')

    const errorDiv = document.getElementById("auth-error");
    if (!errorDiv) throw '"auth-error" not found';
    errorDiv.show = err => {
        errorDiv.style.visibility = "visible";
        errorDiv.innerText = err;
    };
    errorDiv.hide = () => {
        errorDiv.style.visibility = "hidden";
        errorDiv.innerText = "";
    };

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let registrationDate
    if (recoveryInput) registrationDate = recoveryInput.value

    if (email.length === 0) {
        errorDiv.show("Заповніть E-mail");
        return;
    }
    if (password.length === 0) {
        errorDiv.show("Заповніть пароль");
        return;
    }
    if (recoveryInput && registrationDate.length === 0) {
        errorDiv.show("Заповніть дату реєстрації")
        return
    }
    errorDiv.hide()
    console.log(email, password, registrationDate ? registrationDate : 0)

    if (!registrationDate) {
        fetch(`/api/auth?input=${email}&password=${password}`, {
            method: 'GET'
        }).then(r => r.json()).then(j => {
            console.log(j)
            if (j.code != 200) {
                errorDiv.show("Відмова. Перевірьте введені дані")
            } else {
                window.location.reload()
            }
        })
    } else {
        let input = {
            "email": email,
            "password": password,
            "regDate": registrationDate
        }

        fetch(`/api/auth`, {
            method: 'LINK',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(input)
        }).then(r => r.json()).then(j => {
            console.log(j)
            if (j.code != 200) {
                errorDiv.show("Відмова. Перевірьте введені дані")
            } else {
                window.location.reload()
            }
        })
    }
}

function recoveryClick() {
    const recoveryInput = document.querySelector('[name="registration-date"]')
    const emailInput = document.querySelector('[name="auth-user-email"]')
    const recoveryButton = document.querySelector('[id="recovery-button"]')
    const logInButton = document.querySelector('[id="auth-button"]')

    if (!recoveryInput) {
        const newRow = document.createElement('div');
        newRow.classList.add('row');

        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group', 'mb-3');

        const inputGroupText = document.createElement('span');
        inputGroupText.classList.add('input-group-text');
        inputGroupText.id = 'registration-date-addon';
        inputGroupText.innerHTML = '<i class="bi bi-calendar"></i>';

        const newInput = document.createElement('input');
        newInput.type = 'date';
        newInput.name = 'registration-date';
        newInput.classList.add('form-control');
        newInput.placeholder = 'Дата реєстрації';
        newInput.setAttribute('aria-label', 'Дата реєстрації');
        newInput.setAttribute('aria-describedby', 'registration-date-addon');

        inputGroup.appendChild(inputGroupText);
        inputGroup.appendChild(newInput);

        newRow.appendChild(inputGroup);

        document.querySelector('.modal-body').appendChild(newRow);

        recoveryButton.textContent = 'Скасувати'
        logInButton.textContent = 'Відновлення'

        emailInput.placeholder = "Ел. пошта"
    }
    else {
        closeClick()
        recoveryButton.textContent = 'Відновлення'
        logInButton.textContent = 'Вхід'

        emailInput.placeholder = "Ел. пошта / ім'я / дата народження"
    }
}

function closeClick() {
    const registrationDateRow = document.querySelector('[name="registration-date"]')?.closest('.row')
    if (registrationDateRow) registrationDateRow.remove()
}

/*
    fun() { ***** }

    --- await fun() -------
    ---  *****  -------

    --- fun().then(++++) -------
    --- | --------
        | ***** ++++ (C#)

    --- v --------   =============
                  | ***** ++++ (JS)
*/
