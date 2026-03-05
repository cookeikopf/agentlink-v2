// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AgentReputation
 * @notice On-chain Reputation System für AgentLink A2A-Netzwerk
 * @dev Speichert Reputation-Scores für Agenten basierend auf Transaktionen
 */

contract AgentReputation {
    
    struct Reputation {
        uint256 totalScore;        // Kumulierter Score (0-5000 für 0.0-5.0)
        uint256 reviewCount;       // Anzahl Reviews
        uint256 successfulDeals;   // Erfolgreiche Deals
        uint256 failedDeals;       // Fehlgeschlagene Deals
        uint256 lastUpdate;        // Letztes Update Timestamp
    }
    
    struct Review {
        address reviewer;          // Wer hat reviewt
        uint256 score;            // 0-50 (0.0-5.0 mit 1 decimal)
        string comment;           // Optionaler Kommentar
        uint256 timestamp;        // Wann
        bytes32 dealId;          // Referenz zum Deal
    }
    
    // Agent Address => Reputation
    mapping(address => Reputation) public reputations;
    
    // Agent Address => Review Index => Review
    mapping(address => mapping(uint256 => Review)) public reviews;
    
    // Agent Address => Review Count
    mapping(address => uint256) public reviewCounts;
    
    // Authorized contracts that can update reputation
    mapping(address => bool) public authorizedUpdaters;
    
    address public owner;
    
    // Minimum score für neue Agenten (neutral)
    uint256 public constant INITIAL_SCORE = 250; // 2.5/5.0
    uint256 public constant MAX_SCORE = 500;     // 5.0/5.0
    uint256 public constant MIN_SCORE = 0;       // 0.0/5.0
    
    // Events
    event ReputationUpdated(
        address indexed agent,
        uint256 newScore,
        uint256 reviewCount,
        bool successful
    );
    
    event ReviewAdded(
        address indexed agent,
        address indexed reviewer,
        uint256 score,
        bytes32 dealId
    );
    
    event AuthorizedUpdaterAdded(address updater);
    event AuthorizedUpdaterRemoved(address updater);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedUpdaters[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Fügt einen authorized updater hinzu (z.B. PaymentRouter)
     */
    function addAuthorizedUpdater(address _updater) external onlyOwner {
        authorizedUpdaters[_updater] = true;
        emit AuthorizedUpdaterAdded(_updater);
    }
    
    /**
     * @notice Entfernt einen authorized updater
     */
    function removeAuthorizedUpdater(address _updater) external onlyOwner {
        authorizedUpdaters[_updater] = false;
        emit AuthorizedUpdaterRemoved(_updater);
    }
    
    /**
     * @notice Aktualisiert Reputation nach einem Deal
     * @param _agent Der Agent dessen Reputation aktualisiert wird
     * @param _successful Ob der Deal erfolgreich war
     * @param _score Der Score für diesen Deal (0-50)
     */
    function updateReputation(
        address _agent,
        bool _successful,
        uint256 _score
    ) external onlyAuthorized {
        require(_score <= MAX_SCORE, "Score too high");
        
        Reputation storage rep = reputations[_agent];
        
        // Initialisieren wenn neu
        if (rep.reviewCount == 0) {
            rep.totalScore = INITIAL_SCORE;
        }
        
        // Score aktualisieren (gewichteter Durchschnitt)
        // Neue Reviews haben 20% Gewicht
        uint256 newScore;
        if (_successful) {
            newScore = rep.totalScore * 80 / 100 + _score * 20 / 100;
            rep.successfulDeals++;
        } else {
            // Bei Fehlern stärker abwerten
            newScore = rep.totalScore * 70 / 100;
            rep.failedDeals++;
        }
        
        // Begrenzen
        if (newScore > MAX_SCORE) newScore = MAX_SCORE;
        if (newScore < MIN_SCORE) newScore = MIN_SCORE;
        
        rep.totalScore = newScore;
        rep.reviewCount++;
        rep.lastUpdate = block.timestamp;
        
        emit ReputationUpdated(_agent, newScore, rep.reviewCount, _successful);
    }
    
    /**
     * @notice Fügt ein detailliertes Review hinzu
     */
    function addReview(
        address _agent,
        uint256 _score,
        string calldata _comment,
        bytes32 _dealId
    ) external {
        require(_score <= MAX_SCORE, "Score too high");
        require(bytes(_comment).length <= 500, "Comment too long");
        
        uint256 reviewId = reviewCounts[_agent];
        
        reviews[_agent][reviewId] = Review({
            reviewer: msg.sender,
            score: _score,
            comment: _comment,
            timestamp: block.timestamp,
            dealId: _dealId
        });
        
        reviewCounts[_agent]++;
        
        emit ReviewAdded(_agent, msg.sender, _score, _dealId);
        
        // Reputation auch aktualisieren
        this.updateReputation(_agent, true, _score);
    }
    
    /**
     * @notice Holt Reputation für einen Agenten
     */
    function getReputation(address _agent) external view returns (
        uint256 score,
        uint256 reviewCount,
        uint256 successfulDeals,
        uint256 failedDeals,
        uint256 avgScore
    ) {
        Reputation storage rep = reputations[_agent];
        
        // Wenn keine Reviews, gib Initial-Score zurück
        if (rep.reviewCount == 0) {
            return (INITIAL_SCORE, 0, 0, 0, INITIAL_SCORE);
        }
        
        return (
            rep.totalScore,
            rep.reviewCount,
            rep.successfulDeals,
            rep.failedDeals,
            rep.totalScore
        );
    }
    
    /**
     * @notice Holt Reviews für einen Agenten (paginiert)
     */
    function getReviews(
        address _agent,
        uint256 _start,
        uint256 _limit
    ) external view returns (Review[] memory) {
        uint256 total = reviewCounts[_agent];
        if (_start >= total) return new Review[](0);
        
        uint256 end = _start + _limit;
        if (end > total) end = total;
        
        Review[] memory result = new Review[](end - _start);
        for (uint256 i = _start; i < end; i++) {
            result[i - _start] = reviews[_agent][i];
        }
        
        return result;
    }
    
    /**
     * @notice Vergleicht zwei Agenten
     */
    function compareAgents(
        address _agent1,
        address _agent2
    ) external view returns (
        uint256 score1,
        uint256 score2,
        address betterAgent
    ) {
        score1 = reputations[_agent1].totalScore;
        score2 = reputations[_agent2].totalScore;
        
        // Wenn keine Reviews, Initial-Score
        if (reputations[_agent1].reviewCount == 0) score1 = INITIAL_SCORE;
        if (reputations[_agent2].reviewCount == 0) score2 = INITIAL_SCORE;
        
        betterAgent = score1 >= score2 ? _agent1 : _agent2;
    }
    
    /**
     * @notice Holt Top-Agenten nach Reputation
     */
    function getTopAgents(
        address[] calldata _agents
    ) external view returns (
        address[] memory sortedAgents,
        uint256[] memory scores
    ) {
        // Einfache Bubble Sort (für kleine Arrays ok)
        uint256 n = _agents.length;
        sortedAgents = new address[](n);
        scores = new uint256[](n);
        
        // Kopieren
        for (uint256 i = 0; i < n; i++) {
            sortedAgents[i] = _agents[i];
            scores[i] = reputations[_agents[i]].totalScore;
            if (reputations[_agents[i]].reviewCount == 0) {
                scores[i] = INITIAL_SCORE;
            }
        }
        
        // Sortieren (absteigend)
        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = 0; j < n - i - 1; j++) {
                if (scores[j] < scores[j + 1]) {
                    // Swap scores
                    uint256 tempScore = scores[j];
                    scores[j] = scores[j + 1];
                    scores[j + 1] = tempScore;
                    
                    // Swap addresses
                    address tempAddr = sortedAgents[j];
                    sortedAgents[j] = sortedAgents[j + 1];
                    sortedAgents[j + 1] = tempAddr;
                }
            }
        }
        
        return (sortedAgents, scores);
    }
}
