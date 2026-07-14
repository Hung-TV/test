import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../models/dictionary_session_models.dart';
import '../models/dictionary_word_list.dart';

class DictionaryListService {
  final ApiClient _apiClient = ApiClient();

  Future<List<DictionaryWordList>> getLists() async {
    final response = await _apiClient.get(
      ApiConstants.dictionaryListAll,
      requireAuth: true,
    );

    final List<dynamic> listData;
    if (response is List) {
      listData = response;
    } else if (response is Map && response['data'] is List) {
      listData = response['data'] as List;
    } else {
      listData = [];
    }

    return listData
        .map(
          (json) => DictionaryWordList.fromJson(
            Map<String, dynamic>.from(json as Map),
          ),
        )
        .toList();
  }

  Future<DictionaryWordList> createList(String name) async {
    final response = await _apiClient.post(
      ApiConstants.dictionaryListCreate,
      requireAuth: true,
      body: {'name': name},
    );
    return DictionaryWordList.fromJson(Map<String, dynamic>.from(response as Map));
  }

  Future<void> addWordToList({required int listId, required int wordId}) async {
    await _apiClient.put(
      ApiConstants.dictionaryListAddWord,
      requireAuth: true,
      body: {'listId': listId, 'wordId': wordId},
    );
  }

  Future<void> addWordToNewList({
    required String listName,
    required int wordId,
  }) async {
    await _apiClient.put(
      ApiConstants.dictionaryListAddWordToNewList,
      requireAuth: true,
      body: {'listName': listName, 'wordId': wordId},
    );
  }

  Future<VocabularyLearnSessionResponse> getLearnSession({
    required int listId,
    int batchSize = 10,
  }) async {
    final response = await _apiClient.get(
      '${ApiConstants.dictionaryListLearn(listId)}?batchSize=$batchSize',
      requireAuth: true,
    );
    return VocabularyLearnSessionResponse.fromJson(
      Map<String, dynamic>.from(response as Map),
    );
  }

  Future<VocabularyReviewSessionResponse> getReviewSession({
    required int listId,
    int batchSize = 10,
  }) async {
    final response = await _apiClient.get(
      '${ApiConstants.dictionaryListReviewSession(listId)}?batchSize=$batchSize',
      requireAuth: true,
    );
    return VocabularyReviewSessionResponse.fromJson(
      Map<String, dynamic>.from(response as Map),
    );
  }

  Future<VocabularyReviewResultResponse> submitReview({
    required int listId,
    required List<Map<String, dynamic>> reviews,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.dictionaryListReview(listId),
      requireAuth: true,
      body: {'reviews': reviews},
    );
    return VocabularyReviewResultResponse.fromJson(
      Map<String, dynamic>.from(response as Map),
    );
  }

  Future<String> explainReviewAnswer({
    required String correctWord,
    required String selectedWord,
    required String questionType,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.dictionaryListExplain,
      requireAuth: true,
      body: {
        'correctWord': correctWord,
        'selectedWord': selectedWord,
        'questionType': questionType,
      },
    );
    if (response is Map && response['explanation'] != null) {
      return response['explanation'].toString();
    }
    if (response is String && response.trim().isNotEmpty) {
      return response.trim();
    }
    return 'Không có giải thích từ AI.';
  }

  Future<Map<String, dynamic>> getListDetails({
    required int listId,
    required int page,
    required int size,
  }) async {
    final response = await _apiClient.get(
      '${ApiConstants.dictionaryListDetails(listId)}?page=$page&size=$size',
      requireAuth: true,
    );
    return Map<String, dynamic>.from(response as Map);
  }
}

