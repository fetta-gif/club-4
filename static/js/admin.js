$(document).ready(function() {
    // تهيئة جداول البيانات
    const conversationsTable = $('#conversations-table').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/ar.json'
        },
        order: [[3, 'desc']],
        columns: [
            { data: 'id' },
            { data: 'user_message' },
            { data: 'bot_response' },
            { 
                data: 'timestamp',
                render: function(data) {
                    return new Date(data).toLocaleString('ar-SA');
                }
            },
            { data: 'user_ip' }
        ]
    });

    const knowledgeTable = $('#knowledge-table').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/ar.json'
        },
        order: [[0, 'desc']],
        columns: [
            { data: 'id' },
            { data: 'category' },
            { data: 'question' },
            { data: 'answer' },
            { 
                data: 'active',
                render: function(data) {
                    return data ? '<span class="badge bg-success">نشط</span>' : '<span class="badge bg-secondary">غير نشط</span>';
                }
            },
            { 
                data: 'created_at',
                render: function(data) {
                    return new Date(data).toLocaleString('ar-SA');
                }
            },
            { 
                data: 'updated_at',
                render: function(data) {
                    return new Date(data).toLocaleString('ar-SA');
                }
            },
            {
                data: null,
                render: function(data) {
                    return `
                        <button class="btn btn-sm btn-primary edit-knowledge" data-id="${data.id}">
                            تعديل
                        </button>
                        <button class="btn btn-sm btn-danger delete-knowledge" data-id="${data.id}">
                            حذف
                        </button>
                    `;
                }
            }
        ]
    });

    // معالجة إضافة معلومة جديدة
    $('#add-knowledge-btn').click(function() {
        $('#knowledge-modal-title').text('إضافة معلومة جديدة');
        $('#knowledge-form')[0].reset();
        $('#knowledge-id').val('');
        $('#knowledge-modal').modal('show');
    });

    // معالجة تعديل معلومة
    $('#knowledge-table').on('click', '.edit-knowledge', function() {
        const id = $(this).data('id');
        const data = knowledgeTable.row($(this).closest('tr')).data();
        
        $('#knowledge-modal-title').text('تعديل معلومة');
        $('#knowledge-id').val(id);
        $('#category').val(data.category);
        $('#question').val(data.question);
        $('#answer').val(data.answer);
        $('#active').prop('checked', data.active);
        
        $('#knowledge-modal').modal('show');
    });

    // معالجة حذف معلومة
    $('#knowledge-table').on('click', '.delete-knowledge', function() {
        const id = $(this).data('id');
        
        Swal.fire({
            title: 'هل أنت متأكد؟',
            text: 'سيتم حذف هذه المعلومة نهائياً',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteKnowledge(id);
            }
        });
    });

    // معالجة حذف جميع البيانات
    $('#truncate-knowledge-btn').click(function() {
        Swal.fire({
            title: 'هل أنت متأكد؟',
            text: 'سيتم حذف جميع البيانات نهائياً ولا يمكن التراجع عن هذا الإجراء',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف الكل',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#dc3545'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/api/knowledge/truncate', {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(result => {
                    if (result.error) throw new Error(result.error);
                    Swal.fire('تم!', 'تم حذف جميع البيانات بنجاح', 'success');
                    updateDashboard();
                })
                .catch(error => {
                    Swal.fire('خطأ!', error.message, 'error');
                });
            }
        });
    });

    // معالجة حذف جميع المحادثات
    $('#truncate-conversations-btn').click(function() {
        Swal.fire({
            title: 'هل أنت متأكد؟',
            text: 'سيتم حذف جميع المحادثات نهائياً ولا يمكن التراجع عن هذا الإجراء',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف الكل',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#dc3545'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/api/conversations/truncate', {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(result => {
                    if (result.error) throw new Error(result.error);
                    Swal.fire('تم!', 'تم حذف جميع المحادثات بنجاح', 'success');
                    updateDashboard();
                })
                .catch(error => {
                    Swal.fire('خطأ!', error.message, 'error');
                });
            }
        });
    });

    // حفظ المعلومة (إضافة/تعديل)
    $('#save-knowledge').click(function() {
        const id = $('#knowledge-id').val();
        const data = {
            category: $('#category').val(),
            question: $('#question').val(),
            answer: $('#answer').val(),
            active: $('#active').is(':checked')
        };

        if (id) {
            // تعديل
            fetch(`/api/knowledge/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.error) throw new Error(result.error);
                Swal.fire('تم!', 'تم تحديث المعلومة بنجاح', 'success');
                $('#knowledge-modal').modal('hide');
                updateDashboard();
            })
            .catch(error => {
                Swal.fire('خطأ!', error.message, 'error');
            });
        } else {
            // إضافة
            fetch('/api/knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.error) throw new Error(result.error);
                Swal.fire('تم!', 'تمت إضافة المعلومة بنجاح', 'success');
                $('#knowledge-modal').modal('hide');
                updateDashboard();
            })
            .catch(error => {
                Swal.fire('خطأ!', error.message, 'error');
            });
        }
    });

    // حذف معلومة
    function deleteKnowledge(id) {
        fetch(`/api/knowledge/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.error) throw new Error(result.error);
            Swal.fire('تم!', 'تم حذف المعلومة بنجاح', 'success');
            updateDashboard();
        })
        .catch(error => {
            Swal.fire('خطأ!', error.message, 'error');
        });
    }

    // تحديث البيانات
    function updateDashboard() {
        // جلب الإحصائيات
        fetch('/api/analytics')
            .then(response => response.json())
            .then(data => {
                $('#total-conversations').text(data.total_conversations);
                $('#today-conversations').text(data.daily_conversations);
                $('#total-knowledge').text(data.total_knowledge);
                $('#active-knowledge').text(data.active_knowledge);
                
                // تحديث المواضيع الشائعة
                const topicsHtml = data.popular_topics
                    .map(topic => `
                        <div class="popular-topic">
                            <span>${topic.topic}</span>
                            <span class="badge bg-primary">${topic.count}</span>
                        </div>
                    `)
                    .join('');
                $('#popular-topics').html(topicsHtml);
            })
            .catch(error => console.error('Error fetching analytics:', error));

        // جلب المحادثات
        fetch('/api/conversations')
            .then(response => response.json())
            .then(data => {
                conversationsTable.clear();
                conversationsTable.rows.add(data.conversations);
                conversationsTable.draw();
            })
            .catch(error => console.error('Error fetching conversations:', error));

        // جلب قاعدة المعرفة
        fetch('/api/knowledge')
            .then(response => response.json())
            .then(data => {
                knowledgeTable.clear();
                knowledgeTable.rows.add(data.knowledge);
                knowledgeTable.draw();
            })
            .catch(error => console.error('Error fetching knowledge:', error));
    }

    // تحديث البيانات كل 30 ثانية
    updateDashboard();
    setInterval(updateDashboard, 30000);
});
