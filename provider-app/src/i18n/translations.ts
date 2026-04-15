export type ProviderLanguage = 'en' | 'ta';

type TranslationKey =
  | 'providerApp'
  | 'serviceProvider'
  | 'dashboard'
  | 'dashboardRecords'
  | 'requests'
  | 'activeJob'
  | 'quotation'
  | 'menu'
  | 'logout'
  | 'language'
  | 'chooseLanguage'
  | 'languageDescription'
  | 'english'
  | 'tamil'
  | 'signInOrSignUp'
  | 'providerLoginSubtext'
  | 'phone'
  | 'email'
  | 'phoneNumber'
  | 'enterYourMobileNumber'
  | 'providerEmailPlaceholder'
  | 'invalidPhoneOrEmail'
  | 'failedToSendOtp'
  | 'sendingOtp'
  | 'continueWithOtp'
  | 'or'
  | 'continueWithGoogle'
  | 'verifyOtp'
  | 'otpSentTo'
  | 'enterSixDigitOtp'
  | 'invalidSixDigitOtp'
  | 'invalidOrExpiredOtp'
  | 'verifying'
  | 'notAvailable'
  | 'unavailable'
  | 'processing'
  | 'status'
  | 'city'
  | 'service'
  | 'serviceNotSpecified'
  | 'client'
  | 'approvalStatus'
  | 'approved'
  | 'pendingReview'
  | 'rejected'
  | 'online'
  | 'offline'
  | 'availability'
  | 'availabilityHint'
  | 'currentStatus'
  | 'lastUpdated'
  | 'location'
  | 'updating'
  | 'goOffline'
  | 'goOnline'
  | 'nowOnline'
  | 'nowOffline'
  | 'unableUpdateAvailability'
  | 'geolocationNotSupported'
  | 'bookings'
  | 'pendingRequests'
  | 'loadingRequests'
  | 'noPendingRequests'
  | 'newClientBookingsWillAppear'
  | 'noContactDetails'
  | 'notSpecified'
  | 'accept'
  | 'reject'
  | 'bookingAccepted'
  | 'bookingRejected'
  | 'basicPayment'
  | 'save'
  | 'saving'
  | 'unableFetchBookingRequests'
  | 'unableAcceptBooking'
  | 'unableRejectBooking'
  | 'clientIssue'
  | 'createQuotation'
  | 'loadingCurrentJob'
  | 'noAcceptedBookingFound'
  | 'acceptRequestFirstThenQuotation'
  | 'goToRequests'
  | 'quotationAmount'
  | 'enterAmount'
  | 'submitQuotation'
  | 'quotationSubmittedSuccessfully'
  | 'unableFetchActiveBooking'
  | 'acceptBookingBeforeQuotation'
  | 'quotationAllowedWhenAccepted'
  | 'enterValidQuotationAmount'
  | 'unableSubmitQuotation'
  | 'currentBooking'
  | 'noActiveJob'
  | 'acceptRequestToTrackJob'
  | 'viewRequests'
  | 'clientContact'
  | 'submitted'
  | 'pending'
  | 'addQuotation'
  | 'jobCompletedWaitForConfirmation'
  | 'bookingMarkedAs'
  | 'unableUpdateBookingStatus'
  | 'onTheWay'
  | 'inProgress'
  | 'completed'
  | 'providerStatus'
  | 'applicationStatus'
  | 'existingProvidersTrackStatus'
  | 'loadingApplicationStatus'
  | 'failedLoadProviderStatus'
  | 'kycPendingApproval'
  | 'kycRejectedResubmit'
  | 'kycNotSubmittedYet'
  | 'providerAccountActive'
  | 'accountRecord'
  | 'kycRecord'
  | 'name'
  | 'notSet'
  | 'notSubmitted'
  | 'unknown'
  | 'experience'
  | 'years'
  | 'aadhaar'
  | 'created'
  | 'updated'
  | 'refreshStatus'
  | 'resubmitKyc'
  | 'completeKyc'
  | 'providerOnboarding'
  | 'kycDescription'
  | 'fullName'
  | 'pincode'
  | 'address'
  | 'serviceType'
  | 'serviceTypePlaceholder'
  | 'experienceInYears'
  | 'aadhaarNumber'
  | 'afterSubmissionPendingReview'
  | 'viewStatus'
  | 'submitting'
  | 'resubmitForApproval'
  | 'submitKyc'
  | 'loadingKycForm'
  | 'failedLoadProviderKyc'
  | 'kycRequiredFieldsError'
  | 'failedSubmitKyc'
  | 'fullNamePlaceholder'
  | 'cityPlaceholder'
  | 'pincodePlaceholder'
  | 'addressPlaceholder';

const providerTranslations: Record<ProviderLanguage, Record<TranslationKey, string>> = {
  en: {
    providerApp: 'Provider App',
    serviceProvider: 'Service Provider',
    dashboard: 'Dashboard',
    dashboardRecords: 'Provider Records',
    requests: 'Requests',
    activeJob: 'Active Job',
    quotation: 'Quotation',
    menu: 'Menu',
    logout: 'Logout',
    language: 'Language',
    chooseLanguage: 'Choose your language',
    languageDescription: 'Select the app language for your provider dashboard and login flow.',
    english: 'English',
    tamil: 'Tamil',
    signInOrSignUp: 'Sign in or sign up',
    providerLoginSubtext:
      'Use the same OTP flow as the client app. Existing providers go to their records, and new applicants continue to KYC and admin approval.',
    phone: 'Phone',
    email: 'Email',
    phoneNumber: 'Phone number',
    enterYourMobileNumber: 'Enter your mobile number',
    providerEmailPlaceholder: 'provider@example.com',
    invalidPhoneOrEmail: 'Enter a valid phone number or email address.',
    failedToSendOtp: 'Failed to send OTP.',
    sendingOtp: 'Sending OTP...',
    continueWithOtp: 'Continue with OTP',
    or: 'or',
    continueWithGoogle: 'Continue with Google',
    verifyOtp: 'Verify OTP',
    otpSentTo: 'We sent a 6-digit OTP to',
    enterSixDigitOtp: 'Enter the 6-digit OTP.',
    invalidSixDigitOtp: 'Enter the 6-digit OTP.',
    invalidOrExpiredOtp: 'Invalid or expired OTP.',
    verifying: 'Verifying...',
    notAvailable: 'Not available',
    unavailable: 'Unavailable',
    processing: 'Processing...',
    status: 'Status',
    city: 'City',
    service: 'Service',
    serviceNotSpecified: 'Service not specified',
    client: 'Client',
    approvalStatus: 'Approval status',
    approved: 'Approved',
    pendingReview: 'Pending Review',
    rejected: 'Rejected',
    online: 'Online',
    offline: 'Offline',
    availability: 'Availability',
    availabilityHint: 'Control whether nearby clients can see you online.',
    currentStatus: 'Current status',
    lastUpdated: 'Last updated',
    location: 'Location',
    updating: 'Updating...',
    goOffline: 'Go Offline',
    goOnline: 'Go Online',
    nowOnline: 'You are now online.',
    nowOffline: 'You are now offline.',
    unableUpdateAvailability: 'Unable to update availability.',
    geolocationNotSupported: 'Geolocation is not supported in this browser.',
    bookings: 'Bookings',
    pendingRequests: 'Pending Requests',
    loadingRequests: 'Loading requests...',
    noPendingRequests: 'No pending requests',
    newClientBookingsWillAppear: 'New client bookings will appear here.',
    noContactDetails: 'No contact details',
    notSpecified: 'Not specified',
    accept: 'Accept',
    reject: 'Reject',
    bookingAccepted: 'Booking accepted.',
    bookingRejected: 'Booking rejected.',
    basicPayment: 'Basic Payment',
    save: 'Save',
    saving: 'Saving',
    unableFetchBookingRequests: 'Unable to fetch booking requests.',
    unableAcceptBooking: 'Unable to accept booking.',
    unableRejectBooking: 'Unable to reject booking.',
    clientIssue: 'Client issue',
    createQuotation: 'Create Quotation',
    loadingCurrentJob: 'Loading current job...',
    noAcceptedBookingFound: 'No accepted booking found',
    acceptRequestFirstThenQuotation: 'Accept a request first, then create a quotation for that booking.',
    goToRequests: 'Go to Requests',
    quotationAmount: 'Quotation Amount',
    enterAmount: 'Enter amount',
    submitQuotation: 'Submit Quotation',
    quotationSubmittedSuccessfully: 'Quotation submitted successfully.',
    unableFetchActiveBooking: 'Unable to fetch active booking.',
    acceptBookingBeforeQuotation: 'Accept a booking before creating a quotation.',
    quotationAllowedWhenAccepted: 'Quotation can only be submitted when the booking status is accepted.',
    enterValidQuotationAmount: 'Enter a valid quotation amount.',
    unableSubmitQuotation: 'Unable to submit quotation.',
    currentBooking: 'Current Booking',
    noActiveJob: 'No active job',
    acceptRequestToTrackJob: 'Accept a booking request to start tracking the current job.',
    viewRequests: 'View Requests',
    clientContact: 'Client contact',
    submitted: 'Submitted',
    pending: 'Pending',
    addQuotation: 'Add Quotation',
    jobCompletedWaitForConfirmation: 'Job completed. Wait for client confirmation before payment starts.',
    bookingMarkedAs: 'Booking marked as',
    unableUpdateBookingStatus: 'Unable to update booking status.',
    onTheWay: 'On the way',
    inProgress: 'In progress',
    completed: 'Completed',
    providerStatus: 'Provider Status',
    applicationStatus: 'Application Status',
    existingProvidersTrackStatus: 'Existing providers can keep track of their onboarding record here until admin approval.',
    loadingApplicationStatus: 'Loading application status...',
    failedLoadProviderStatus: 'Failed to load provider status.',
    kycPendingApproval: 'Your KYC has been submitted and is waiting for admin approval.',
    kycRejectedResubmit: 'Your last application was rejected. Review your details and resubmit when ready.',
    kycNotSubmittedYet: 'Your account is signed in, but KYC has not been submitted yet.',
    providerAccountActive: 'Your provider account is active.',
    accountRecord: 'Account Record',
    kycRecord: 'KYC Record',
    name: 'Name',
    notSet: 'Not set',
    notSubmitted: 'Not submitted',
    unknown: 'Unknown',
    experience: 'Experience',
    years: 'years',
    aadhaar: 'Aadhaar',
    created: 'Created',
    updated: 'Updated',
    refreshStatus: 'Refresh Status',
    resubmitKyc: 'Resubmit KYC',
    completeKyc: 'Complete KYC',
    providerOnboarding: 'Provider Onboarding',
    kycDescription: 'Fill in your details so the admin can review and approve your provider account.',
    fullName: 'Full name',
    pincode: 'Pincode',
    address: 'Address',
    serviceType: 'Service type',
    serviceTypePlaceholder: 'Electrician',
    experienceInYears: 'Experience in years',
    aadhaarNumber: 'Aadhaar number',
    afterSubmissionPendingReview: 'After submission, your account will stay in pending review until an admin approves it.',
    viewStatus: 'View Status',
    submitting: 'Submitting...',
    resubmitForApproval: 'Resubmit for Approval',
    submitKyc: 'Submit KYC',
    loadingKycForm: 'Loading KYC form...',
    failedLoadProviderKyc: 'Failed to load provider KYC details.',
    kycRequiredFieldsError: 'Name, city, service type, and a valid 12-digit Aadhaar number are required.',
    failedSubmitKyc: 'Failed to submit KYC.',
    fullNamePlaceholder: 'Ravi Kumar',
    cityPlaceholder: 'Sivakasi',
    pincodePlaceholder: '626123',
    addressPlaceholder: 'Door no, street, area',
  },
  ta: {
    providerApp: 'சேவை வழங்குநர் பயன்பாடு',
    serviceProvider: 'சேவை வழங்குநர்',
    dashboard: 'டாஷ்போர்டு',
    dashboardRecords: 'சேவை வழங்குநர் பதிவுகள்',
    requests: 'கோரிக்கைகள்',
    activeJob: 'செயலில் உள்ள பணி',
    quotation: 'விலைப்பத்திரம்',
    menu: 'மெனு',
    logout: 'வெளியேறு',
    language: 'மொழி',
    chooseLanguage: 'உங்கள் மொழியை தேர்ந்தெடுக்கவும்',
    languageDescription: 'சேவை வழங்குநர் டாஷ்போர்டு மற்றும் உள்நுழைவு செயல்முறைக்கான பயன்பாட்டு மொழியை தேர்வு செய்யவும்.',
    english: 'ஆங்கிலம்',
    tamil: 'தமிழ்',
    signInOrSignUp: 'உள்நுழைக அல்லது பதிவு செய்யவும்',
    providerLoginSubtext:
      'வாடிக்கையாளர் பயன்பாட்டைப் போலவே OTP செயல்முறையை பயன்படுத்துங்கள். உள்ள வழங்குநர்கள் தங்கள் பதிவுகளுக்கு செல்கிறார்கள்; புதிய விண்ணப்பதாரர்கள் KYC மற்றும் நிர்வாக அங்கீகாரத்திற்கு தொடர்கிறார்கள்.',
    phone: 'தொலைபேசி',
    email: 'மின்னஞ்சல்',
    phoneNumber: 'தொலைபேசி எண்',
    enterYourMobileNumber: 'உங்கள் மொபைல் எண்ணை உள்ளிடவும்',
    providerEmailPlaceholder: 'provider@example.com',
    invalidPhoneOrEmail: 'சரியான தொலைபேசி எண் அல்லது மின்னஞ்சல் முகவரியை உள்ளிடவும்.',
    failedToSendOtp: 'OTP அனுப்ப முடியவில்லை.',
    sendingOtp: 'OTP அனுப்பப்படுகிறது...',
    continueWithOtp: 'OTP மூலம் தொடரவும்',
    or: 'அல்லது',
    continueWithGoogle: 'Google மூலம் தொடரவும்',
    verifyOtp: 'OTP சரிபார்க்கவும்',
    otpSentTo: '6 இலக்க OTP அனுப்பப்பட்டது',
    enterSixDigitOtp: '6 இலக்க OTP ஐ உள்ளிடவும்.',
    invalidSixDigitOtp: '6 இலக்க OTP ஐ உள்ளிடவும்.',
    invalidOrExpiredOtp: 'தவறானது அல்லது காலாவதியான OTP.',
    verifying: 'சரிபார்க்கப்படுகிறது...',
    notAvailable: 'கிடைக்கவில்லை',
    unavailable: 'கிடைக்கவில்லை',
    processing: 'செயலாக்கப்படுகிறது...',
    status: 'நிலை',
    city: 'நகரம்',
    service: 'சேவை',
    serviceNotSpecified: 'சேவை குறிப்பிடப்படவில்லை',
    client: 'வாடிக்கையாளர்',
    approvalStatus: 'அங்கீகார நிலை',
    approved: 'அங்கீகரிக்கப்பட்டது',
    pendingReview: 'பரிசீலனையில் உள்ளது',
    rejected: 'நிராகரிக்கப்பட்டது',
    online: 'ஆன்லைன்',
    offline: 'ஆஃப்லைன்',
    availability: 'கிடைப்புநிலை',
    availabilityHint: 'அருகிலுள்ள வாடிக்கையாளர்கள் உங்களை ஆன்லைனில் பார்க்க வேண்டுமா என்பதை கட்டுப்படுத்துங்கள்.',
    currentStatus: 'தற்போதைய நிலை',
    lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
    location: 'இருப்பிடம்',
    updating: 'புதுப்பிக்கப்படுகிறது...',
    goOffline: 'ஆஃப்லைனாக செல்லவும்',
    goOnline: 'ஆன்லைனாக செல்லவும்',
    nowOnline: 'நீங்கள் இப்போது ஆன்லைனில் உள்ளீர்கள்.',
    nowOffline: 'நீங்கள் இப்போது ஆஃப்லைனில் உள்ளீர்கள்.',
    unableUpdateAvailability: 'கிடைப்புநிலையை புதுப்பிக்க முடியவில்லை.',
    geolocationNotSupported: 'இந்த உலாவியில் இடமறிதல் வசதி ஆதரிக்கப்படவில்லை.',
    bookings: 'முன்பதிவுகள்',
    pendingRequests: 'நிலுவை கோரிக்கைகள்',
    loadingRequests: 'கோரிக்கைகள் ஏற்றப்படுகிறது...',
    noPendingRequests: 'நிலுவை கோரிக்கைகள் இல்லை',
    newClientBookingsWillAppear: 'புதிய வாடிக்கையாளர் முன்பதிவுகள் இங்கே தோன்றும்.',
    noContactDetails: 'தொடர்பு விவரங்கள் இல்லை',
    notSpecified: 'குறிப்பிடப்படவில்லை',
    accept: 'ஏற்கவும்',
    reject: 'நிராகரிக்கவும்',
    bookingAccepted: 'முன்பதிவு ஏற்கப்பட்டது.',
    bookingRejected: 'முன்பதிவு நிராகரிக்கப்பட்டது.',
    basicPayment: 'Basic Payment',
    save: 'Save',
    saving: 'Saving',
    unableFetchBookingRequests: 'முன்பதிவு கோரிக்கைகளை பெற முடியவில்லை.',
    unableAcceptBooking: 'முன்பதிவை ஏற்க முடியவில்லை.',
    unableRejectBooking: 'முன்பதிவை நிராகரிக்க முடியவில்லை.',
    clientIssue: 'வாடிக்கையாளர் பிரச்சனை',
    createQuotation: 'விலைப்பத்திரம் உருவாக்கவும்',
    loadingCurrentJob: 'தற்போதைய பணி ஏற்றப்படுகிறது...',
    noAcceptedBookingFound: 'ஏற்றுக்கொள்ளப்பட்ட முன்பதிவு இல்லை',
    acceptRequestFirstThenQuotation: 'முதலில் ஒரு கோரிக்கையை ஏற்கவும், பிறகு அந்த முன்பதிவுக்கான விலைப்பத்திரம் உருவாக்கவும்.',
    goToRequests: 'கோரிக்கைகள் பக்கத்துக்கு செல்லவும்',
    quotationAmount: 'விலைப்பத்திர தொகை',
    enterAmount: 'தொகையை உள்ளிடவும்',
    submitQuotation: 'விலைப்பத்திரம் சமர்ப்பிக்கவும்',
    quotationSubmittedSuccessfully: 'விலைப்பத்திரம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
    unableFetchActiveBooking: 'செயலில் உள்ள முன்பதிவை பெற முடியவில்லை.',
    acceptBookingBeforeQuotation: 'விலைப்பத்திரம் உருவாக்க முன் ஒரு முன்பதிவை ஏற்கவும்.',
    quotationAllowedWhenAccepted: 'முன்பதிவு நிலை ஏற்றுக்கொள்ளப்பட்டால் மட்டுமே விலைப்பத்திரம் சமர்ப்பிக்க முடியும்.',
    enterValidQuotationAmount: 'செல்லுபடியாகும் விலைப்பத்திர தொகையை உள்ளிடவும்.',
    unableSubmitQuotation: 'விலைப்பத்திரம் சமர்ப்பிக்க முடியவில்லை.',
    currentBooking: 'தற்போதைய முன்பதிவு',
    noActiveJob: 'செயலில் பணி இல்லை',
    acceptRequestToTrackJob: 'தற்போதைய பணியை கண்காணிக்க ஒரு முன்பதிவு கோரிக்கையை ஏற்கவும்.',
    viewRequests: 'கோரிக்கைகளை பார்க்கவும்',
    clientContact: 'வாடிக்கையாளர் தொடர்பு',
    submitted: 'சமர்ப்பிக்கப்பட்டது',
    pending: 'நிலுவையில்',
    addQuotation: 'விலைப்பத்திரம் சேர்க்கவும்',
    jobCompletedWaitForConfirmation: 'பணி முடிந்தது. கட்டணம் தொடங்குவதற்கு முன் வாடிக்கையாளர் உறுதிப்படுத்தலை காத்திருக்கவும்.',
    bookingMarkedAs: 'முன்பதிவு இந்த நிலைக்கு மாற்றப்பட்டது',
    unableUpdateBookingStatus: 'முன்பதிவு நிலையை புதுப்பிக்க முடியவில்லை.',
    onTheWay: 'வந்துகொண்னிருக்கிறேன்',
    inProgress: 'நடைபெறுகிறது',
    completed: 'முடிந்தது',
    providerStatus: 'வழங்குநர் நிலை',
    applicationStatus: 'விண்ணப்ப நிலை',
    existingProvidersTrackStatus: 'நிர்வாக அங்கீகாரம் வரும் வரை உங்கள் ஆன்போர்டிங் பதிவை இங்கே கண்காணிக்கலாம்.',
    loadingApplicationStatus: 'விண்ணப்ப நிலை ஏற்றப்படுகிறது...',
    failedLoadProviderStatus: 'வழங்குநர் நிலையை ஏற்ற முடியவில்லை.',
    kycPendingApproval: 'உங்கள் KYC சமர்ப்பிக்கப்பட்டுள்ளது; நிர்வாக அங்கீகாரத்துக்காக காத்திருக்கிறது.',
    kycRejectedResubmit: 'உங்கள் கடைசி விண்ணப்பம் நிராகரிக்கப்பட்டது. விவரங்களை சரிபார்த்து மீண்டும் சமர்ப்பிக்கவும்.',
    kycNotSubmittedYet: 'நீங்கள் உள்நுழைந்துள்ளீர்கள்; ஆனால் KYC இன்னும் சமர்ப்பிக்கப்படவில்லை.',
    providerAccountActive: 'உங்கள் வழங்குநர் கணக்கு செயல்பாட்டில் உள்ளது.',
    accountRecord: 'கணக்கு பதிவு',
    kycRecord: 'KYC பதிவு',
    name: 'பெயர்',
    notSet: 'அமைக்கப்படவில்லை',
    notSubmitted: 'சமர்ப்பிக்கப்படவில்லை',
    unknown: 'தெரியவில்லை',
    experience: 'அனுபவம்',
    years: 'ஆண்டுகள்',
    aadhaar: 'ஆதார்',
    created: 'உருவாக்கப்பட்டது',
    updated: 'புதுப்பிக்கப்பட்டது',
    refreshStatus: 'நிலையை புதுப்பிக்கவும்',
    resubmitKyc: 'KYC மீண்டும் சமர்ப்பிக்கவும்',
    completeKyc: 'KYC முடிக்கவும்',
    providerOnboarding: 'வழங்குநர் ஆன்போர்டிங்',
    kycDescription: 'நிர்வாகி பரிசீலித்து அங்கீகரிக்க உங்கள் விவரங்களை நிரப்பவும்.',
    fullName: 'முழு பெயர்',
    pincode: 'அஞ்சல் குறியீடு',
    address: 'முகவரி',
    serviceType: 'சேவை வகை',
    serviceTypePlaceholder: 'எ.கா. மின்சார வேலை',
    experienceInYears: 'அனுபவ ஆண்டுகள்',
    aadhaarNumber: 'ஆதார் எண்',
    afterSubmissionPendingReview: 'சமர்ப்பித்த பிறகு நிர்வாகி அங்கீகரிக்கும் வரை உங்கள் கணக்கு பரிசீலனையில் இருக்கும்.',
    viewStatus: 'நிலையை பார்க்கவும்',
    submitting: 'சமர்ப்பிக்கப்படுகிறது...',
    resubmitForApproval: 'அங்கீகாரத்துக்கு மீண்டும் சமர்ப்பிக்கவும்',
    submitKyc: 'KYC சமர்ப்பிக்கவும்',
    loadingKycForm: 'KYC படிவம் ஏற்றப்படுகிறது...',
    failedLoadProviderKyc: 'வழங்குநர் KYC விவரங்களை ஏற்ற முடியவில்லை.',
    kycRequiredFieldsError: 'பெயர், நகரம், சேவை வகை மற்றும் செல்லுபடியாகும் 12 இலக்க ஆதார் எண் அவசியம்.',
    failedSubmitKyc: 'KYC சமர்ப்பிக்க முடியவில்லை.',
    fullNamePlaceholder: 'ரவி குமார்',
    cityPlaceholder: 'சிவகாசி',
    pincodePlaceholder: '626612',
    addressPlaceholder: 'வீட்டு எண், தெரு, பகுதி',
  },
};

export const getProviderLanguage = (): ProviderLanguage => {
  const saved = localStorage.getItem('provider_language');
  if (saved === 'en' || saved === 'ta') {
    return saved;
  }

  return navigator.language?.toLowerCase().startsWith('ta') ? 'ta' : 'en';
};

export const setProviderLanguage = (language: ProviderLanguage): void => {
  localStorage.setItem('provider_language', language);
};

export const providerT = (key: TranslationKey): string => {
  const language = getProviderLanguage();
  return providerTranslations[language][key] || providerTranslations.en[key];
};
