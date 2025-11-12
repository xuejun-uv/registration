// This API route handles the redirect from FormSG after form submission
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the submission ID or other parameters from FormSG
    const { submissionId, success, formId } = req.query;
    
    if (success && submissionId) {
      // If FormSG provides a submission ID, we could map it to a user
      // For now, we'll redirect to the stamp page with a message
      return res.redirect(`/stamps?submissionId=${submissionId}&success=true`);
    } else {
      // If no submission ID, redirect to home with error
      return res.redirect('/?error=form-submission-failed');
    }
    
  } catch (error) {
    console.error('Error handling FormSG redirect:', error);
    return res.redirect('/?error=redirect-error');
  }
}