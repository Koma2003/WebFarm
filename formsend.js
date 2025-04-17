document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('feedback-form');
  
  if (!form) {
    console.error('Форма не найдена! Проверьте ID элемента');
    return;
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    try {
      const formData = {
        name: form.querySelector('[name="name"]').value,
        email: form.querySelector('[name="email"]').value,
        message: form.querySelector('[name="message"]').value
      };

      console.log('Отправка данных:', formData);

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Debug': 'frontend-1.0'
        },
        body: JSON.stringify(formData)
      });

      console.log('Статус ответа:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      alert(result.message);
      form.reset();

    } catch (error) {
      console.error('Полная ошибка:', error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
    }
  });
});